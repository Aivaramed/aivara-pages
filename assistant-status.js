const statusCopy = {
  zh: {status:'公网连接配置中', body:'AI 助手已在本地服务器运行。公网连接尚未完成，因此目前还不能通过本站开始对话。', scope:'连接完成后，您将通过专属界面登录并与我们服务器上的 Qwen 模型对话。疗诊一体化智能体尚未开放。', notice:'请勿提交可识别患者身份的信息。AI 输出需由专业人员复核。', home:'返回 Aivara 首页', try:'检查聊天站点（可能尚未可用）'},
  en: {status:'Public connection in setup', body:'The Assistant is running on our local server. Its public connection is not yet ready, so conversations cannot start from this website yet.', scope:'Once connected, sign in to the custom workspace to chat with Qwen running on our server. The theranostics agent is not enabled yet.', notice:'Do not submit identifiable patient information. AI outputs require professional review.', home:'Back to Aivara', try:'Check chat site (may not be available yet)'}
};
function showStatusLanguage(language) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'Aivara Assistant | 连接状态' : 'Aivara Assistant | Connection status';
  document.querySelectorAll('[data-copy]').forEach(node => {node.textContent = statusCopy[language][node.dataset.copy];});
  document.querySelectorAll('[data-lang]').forEach(button => {const selected = button.dataset.lang === language; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));});
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {localStorage.setItem('aivara-language', button.dataset.lang); showStatusLanguage(button.dataset.lang);}));
showStatusLanguage(localStorage.getItem('aivara-language') === 'en' ? 'en' : 'zh');
