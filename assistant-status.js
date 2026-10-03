const statusCopy = {
  zh: {status:'聊天站点已连接', body:'AI 助手已连接。您现在可以通过专属界面登录并与我们服务器上的 Qwen 模型对话。', scope:'请使用现有账户登录。疗诊一体化智能体尚未开放。', notice:'请勿提交可识别患者身份的信息。AI 输出需由专业人员复核。', home:'返回 Aivara 首页', try:'打开 AI 助手'},
  en: {status:'Chat connection ready', body:'The Assistant is connected. Sign in to the custom workspace to chat with Qwen running on our server.', scope:'Sign in with your existing account. The theranostics agent is not enabled yet.', notice:'Do not submit identifiable patient information. AI outputs require professional review.', home:'Back to Aivara', try:'Open AI Assistant'}
};
function showStatusLanguage(language) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'Aivara Assistant | 连接状态' : 'Aivara Assistant | Connection status';
  document.querySelectorAll('[data-copy]').forEach(node => {node.textContent = statusCopy[language][node.dataset.copy];});
  document.querySelectorAll('[data-lang]').forEach(button => {const selected = button.dataset.lang === language; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));});
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {localStorage.setItem('aivara-language', button.dataset.lang); showStatusLanguage(button.dataset.lang);}));
showStatusLanguage(localStorage.getItem('aivara-language') === 'en' ? 'en' : 'zh');
