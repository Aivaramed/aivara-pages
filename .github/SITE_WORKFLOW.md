# Aivara 网站发布流程

当前架构：GPT Sites 仅用于编辑和本人预览；`Aivaramed/aivara-pages` 的 `main` 分支由 GitHub Pages 发布到 `aivaramed.com`。网页来源是 Sites 项目 `appgprj_6ab3a915d028819192f02357c02a8f72` 的 `dist/`。同步是单向的：Sites → GitHub。GitHub 仓库中的 `CNAME`、`README.md` 和 `.github/` 不属于 Sites 网页产物。

## 每次更新

1. **在 Sites 完成修改。** 保存版本，记录该版本的 `source.commit_sha`。预览中检查中英文、桌面和手机布局、图片与链接。若只是尚未保存的预览，先保存源版本。
2. **取回最新 Sites 源码。** 使用 Sites 的短期源仓库凭据和 `site-workflow.mjs` 的打开流程，将远端源码更新到独立本地目录。凭据只通过工具的隐藏标准输入传入，不写入脚本、Git 配置或仓库。检查本地 `git rev-parse HEAD` 与第 1 步的提交号完全一致。
3. **预检。** 在此仓库根目录运行：

   ```sh
   python3 .github/scripts/sync_sites_to_github.py \
     --source /Users/jacob/Desktop/Aivara/sites-current \
     --source-commit <Sites保存版本的完整提交号>
   ```

   预检不修改文件。核对输出的 `copy`、`remove` 清单，尤其是产品图、文案和删除项。脚本还检查源仓库无本地修改、来源提交号、项目 ID、GitHub 仓库与分支、主域 `CNAME`、HTML 本地资源引用和 JavaScript 语法。
4. **直接发布。** 清单符合本次改动后，使用相同参数并加 `--publish`。脚本先拉取 GitHub `main` 的最新状态；若远端已变化则停止。随后只复制 Sites `dist/` 的文件，删除上次同步清单中已从 Sites 移除的文件，写入来源记录，提交并非强制推送到 `main`。输出的 `github_commit` 是本次 GitHub 生产版本。此操作需要本机 Git 对 `Aivaramed/aivara-pages` 有写权限。

   ```sh
   python3 .github/scripts/sync_sites_to_github.py \
     --source /Users/jacob/Desktop/Aivara/sites-current \
     --source-commit <Sites保存版本的完整提交号> \
     --publish
   ```

5. **确认部署。** 查看该 GitHub 提交对应的 Pages 工作流成功，再检查 `https://aivaramed.com/` 的 HTTPS、中英文、图片和链接。DNS 或证书尚在生效时，以 GitHub 提交及 Pages 部署状态分别记录，不把域名暂时打不开误记为同步失败。

## 操作边界

- 每次只发布已保存且已核对来源提交号的 Sites 版本。绝不直接从过期的本地 `site/` 副本上传。
- 脚本的管理文件清单保存在 `.github/sites-sync.json`。首次同步没有旧清单，因此不会删除 GitHub 仓库的额外文件；以后仅删除旧清单中记录且已从 Sites `dist/` 消失的文件。
- `CNAME`、仓库说明和操作文件保持在 GitHub 端。网站文字、样式、脚本和素材以 Sites 版本为准，避免两边各自修改后覆盖。
- 预检或推送失败时停止发布。若提交已创建但推送失败，本地提交会保留；先检查 GitHub 远端是否出现新提交，再决定重试或协调变更。不要强制推送。
- 需要回退时，针对本次 GitHub 提交创建 `git revert` 提交并推送，再确认 Pages 部署和页面内容。不要改写 `main` 的历史。

## 首次启用说明

首次发布时本文件和同步脚本尚未提交，在预检与发布命令中额外加 `--include-workflow-files`。完成首次提交后，日常发布无需此参数。
