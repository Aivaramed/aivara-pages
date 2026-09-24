#!/usr/bin/env python3
"""Sync one saved Aivara Sites source commit to the GitHub Pages main branch."""

import argparse
import hashlib
import json
import os
import posixpath
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


PROJECT_ID = "appgprj_6ab3a915d028819192f02357c02a8f72"
REPOSITORY = "https://github.com/Aivaramed/aivara-pages.git"
DOMAIN = "aivaramed.com"
MANIFEST = Path(".github/sites-sync.json")
WORKFLOW_FILES = {
    ".github/SITE_WORKFLOW.md",
    ".github/scripts/sync_sites_to_github.py",
}
RESERVED = {".git", ".github", ".openai", "CNAME", "README.md", ".nojekyll"}


def fail(message):
    raise SystemExit(message)


def run(*args, cwd, check=True):
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0")
    result = subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True)
    if check and result.returncode:
        fail(f"{' '.join(args)} failed: {result.stderr.strip() or result.stdout.strip()}")
    return result


def git(repo, *args, check=True):
    return run("git", *args, cwd=repo, check=check)


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def tracked_status(repo):
    raw = git(repo, "status", "--porcelain=v1", "-z", "--untracked-files=all").stdout
    return {item[3:] for item in raw.split("\0") if item}


class LocalReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name not in {"href", "src"} or not value:
                continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            self.paths.add(posixpath.normpath(unquote(parsed.path).lstrip("/")))


def validate_source(source, expected_commit):
    source = source.resolve()
    if not (source / ".git").exists():
        fail("Source must be a fetched Sites Git checkout.")
    manifest_path = source / ".openai/hosting.json"
    if not manifest_path.is_file():
        fail("Sites hosting manifest is missing.")
    if json.loads(manifest_path.read_text())["project_id"] != PROJECT_ID:
        fail("Sites project ID does not match this website.")
    actual = git(source, "rev-parse", "HEAD").stdout.strip()
    if actual != expected_commit:
        fail(f"Sites checkout is at {actual}; expected saved version {expected_commit}.")
    if tracked_status(source):
        fail("Sites checkout has local changes; fetch or reconcile them first.")
    dist = source / "dist"
    if not (dist / "index.html").is_file():
        fail("Sites output is missing dist/index.html.")
    files = {}
    for path in sorted(dist.rglob("*")):
        if path.is_symlink():
            fail(f"Symlinks are not allowed in Sites output: {path}")
        if not path.is_file():
            continue
        relative = path.relative_to(dist)
        if relative.parts[0] in RESERVED or any(part.startswith(".") for part in relative.parts):
            fail(f"Reserved or hidden output path: {relative}")
        files[relative.as_posix()] = path
    parser = LocalReferences()
    parser.feed((dist / "index.html").read_text(encoding="utf-8"))
    for reference in sorted(parser.paths):
        if reference == ".." or reference.startswith("../"):
            fail(f"HTML reference leaves the site root: {reference}")
        if reference not in files and not (dist / reference).is_dir():
            fail(f"HTML references missing local file: {reference}")
    if "script.js" in files:
        run("node", "--check", str(files["script.js"]), cwd=source)
    return files


def validate_target(target, allow_workflow_files):
    target = target.resolve()
    if git(target, "rev-parse", "--show-toplevel").stdout.strip() != str(target):
        fail("Target must be the root of the GitHub Pages checkout.")
    if git(target, "branch", "--show-current").stdout.strip() != "main":
        fail("GitHub Pages checkout must be on main.")
    if git(target, "remote", "get-url", "origin").stdout.strip() != REPOSITORY:
        fail("GitHub Pages origin is not the Aivaramed production repository.")
    if (target / "CNAME").read_text().strip() != DOMAIN:
        fail("GitHub Pages CNAME must contain aivaramed.com.")
    status = tracked_status(target)
    allowed = WORKFLOW_FILES if allow_workflow_files else set()
    if status - allowed:
        fail(f"GitHub checkout has unrelated changes: {sorted(status - allowed)}")


def existing_manifest(target):
    path = target / MANIFEST
    if not path.exists():
        return set()
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("project_id") != PROJECT_ID or data.get("schema_version") != 1:
        fail("Existing sync manifest belongs to another source or schema.")
    old = set(data["managed_files"])
    for name in old:
        parts = Path(name).parts
        if not parts or parts[0] in RESERVED or any(part.startswith(".") for part in parts):
            fail(f"Unsafe path in existing sync manifest: {name}")
    return old


def plan(files, target, old):
    changed = [name for name, path in files.items()
               if not (target / name).is_file() or sha256(path) != sha256(target / name)]
    removed = sorted(old - files.keys())
    return changed, removed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path, help="current Sites Git checkout")
    parser.add_argument("--source-commit", required=True, help="commit SHA of the saved Sites version")
    parser.add_argument("--target", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--publish", action="store_true", help="commit and push verified files to main")
    parser.add_argument("--include-workflow-files", action="store_true",
                        help="include newly added workflow documentation and script")
    args = parser.parse_args()
    source, target = args.source.resolve(), args.target.resolve()
    files = validate_source(source, args.source_commit)
    validate_target(target, args.include_workflow_files)
    if args.publish:
        git(target, "fetch", "--no-tags", "origin", "main")
        if git(target, "rev-parse", "HEAD").stdout.strip() != git(target, "rev-parse", "origin/main").stdout.strip():
            fail("GitHub main changed or has an unpublished local commit; reconcile before publishing.")
    old = existing_manifest(target)
    changed, removed = plan(files, target, old)
    summary = {
        "source_commit": args.source_commit,
        "github_base": git(target, "rev-parse", "HEAD").stdout.strip(),
        "copy": changed,
        "remove": removed,
        "managed_file_count": len(files),
        "workflow_files": sorted(tracked_status(target) & WORKFLOW_FILES),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not args.publish:
        return
    for name in changed:
        destination = target / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(files[name], destination)
    for name in removed:
        (target / name).unlink()
    data = {
        "schema_version": 1,
        "project_id": PROJECT_ID,
        "source_commit": args.source_commit,
        "managed_files": sorted(files),
    }
    manifest = target / MANIFEST
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for name, path in files.items():
        if sha256(path) != sha256(target / name):
            fail(f"Copied file did not match Sites source: {name}")
    git(target, "add", "-A", "--", ".")
    staged = {name for name in git(target, "diff", "--cached", "--name-only", "-z").stdout.split("\0") if name}
    allowed = set(files) | set(removed) | {MANIFEST.as_posix()}
    if args.include_workflow_files:
        allowed |= WORKFLOW_FILES
    if staged - allowed:
        fail(f"Unexpected staged paths: {sorted(staged - allowed)}")
    git(target, "diff", "--cached", "--check")
    if not staged:
        print("No GitHub changes to publish.")
        return
    git(target, "commit", "-m", f"Sync Sites source {args.source_commit[:12]}",
        "-m", f"Sites-Source: {args.source_commit}")
    published = git(target, "rev-parse", "HEAD").stdout.strip()
    git(target, "push", "origin", "HEAD:main")
    remote = git(target, "ls-remote", "origin", "refs/heads/main").stdout.split()[0]
    if remote != published:
        fail("GitHub push returned, but remote main does not match the published commit.")
    print(json.dumps({"github_commit": published, "source_commit": args.source_commit,
                      "status": "pushed_to_main"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
