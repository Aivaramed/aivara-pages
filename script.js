const translations = {
  zh: {
    title: 'AivaraSuite | 核医学精准诊疗软件', description: 'AivaraSuite 核医学精准诊疗软件：影像查看、配准融合、分割、定量及临床复核与报告。',
    skip: '跳转至内容', navSuite: '套件', navSolutions: '产品', heroTitle: '让核医学影像分析<br><em>更加清晰、连贯</em>',
    heroBody: '从影像查看与融合，到分割、定量及临床复核，AivaraSuite 将核医学分析工作流程汇于一处。',
    exploreSuite: '了解 AivaraSuite', heroBottom: '精密影像 · 连贯分析', suiteKicker: '统一工作流程',
    suiteIntro: '围绕核医学影像的关键环节，连接阅片、配准融合、分割、定量与临床复核报告。',
    step1: '影像查看', step2: '配准与融合', step3: '分割', step4: '定量', step5: '临床复核与报告',
    solutionsKicker: '应用方向', solutionsTitle: '面向不同临床场景的分析模块', solutionsIntro: '查看每个模块的影像示例与主要分析环节。',
    bioNote: 'Aivara 产品家族还包括 AivaraBio。', footerText: '核医学精准诊疗软件', backTop: '返回顶部 ↑',
    suiteAlt: 'AivaraSuite 软件套件概览', productAlt: (name) => `${name} 影像分析示例`
  },
  en: {
    title: 'AivaraSuite | Precision Nuclear Medicine Software', description: 'AivaraSuite connects image viewing, registration and fusion, segmentation, quantification, and clinical review and reporting.',
    skip: 'Skip to content', navSuite: 'Suite', navSolutions: 'Solutions', heroTitle: 'Nuclear medicine,<br><em>clearly connected</em>',
    heroBody: 'From image viewing and fusion to segmentation, quantification, and clinical review, AivaraSuite brings the analysis workflow together.',
    exploreSuite: 'Explore AivaraSuite', heroBottom: 'Precision imaging · Connected analysis', suiteKicker: 'One connected workflow',
    suiteIntro: 'AivaraSuite connects the key steps in nuclear medicine imaging: viewing, registration and fusion, segmentation, quantification, and clinical review and reporting.',
    step1: 'Image viewing', step2: 'Registration & fusion', step3: 'Segmentation', step4: 'Quantification', step5: 'Clinical review & report',
    solutionsKicker: 'Applications', solutionsTitle: 'Analysis for distinct clinical contexts', solutionsIntro: 'Explore imaging examples and the main analysis steps for each module.',
    bioNote: 'The Aivara family also includes AivaraBio.', footerText: 'Precision nuclear medicine software', backTop: 'Back to top ↑',
    suiteAlt: 'Overview of the AivaraSuite software suite', productAlt: (name) => `${name} imaging analysis example`
  }
};

const products = {
  onco: { name: 'Onco', index: '01', accent: '#f37436', file: 'AivaraOnco', zh: { summary: '多示踪剂影像融合、病灶定量与纵向随访。', features: ['PSMA / FDG 多示踪剂融合对比', '可供临床编辑的辅助分割', '病灶定量分析与治疗反应可视化'] }, en: { summary: 'Multi-tracer image fusion, lesion quantification, and longitudinal follow-up.', features: ['PSMA / FDG fusion comparison', 'Clinically editable assisted segmentation', 'Lesion quantification and therapy response visualization'] } },
  dose: { name: 'Dosimetry', index: '02', accent: '#a947e9', file: 'AivaraDosimetry', zh: { summary: '连接多时间点影像处理与吸收剂量评估。', features: ['多时间点影像配准', '器官与靶区分割及临床复核', '时间-活度曲线、吸收剂量与报告'] }, en: { summary: 'From multi-timepoint imaging to absorbed dose assessment.', features: ['Multi-timepoint image registration', 'Organ and target segmentation with clinician review', 'Time–activity curves, absorbed dose, and reporting'] } },
  cardio: { name: 'Cardio', index: '03', accent: '#ed433a', file: 'AivaraCardio', zh: { summary: '面向心血管影像的分割、摄取评估与区域定量。', features: ['主动脉辅助分割', '血管摄取评估', '全主动脉及区域定量分析'] }, en: { summary: 'Segmentation, uptake assessment, and regional quantification for cardiovascular imaging.', features: ['Assisted aortic segmentation', 'Vascular uptake assessment', 'Whole-aorta and regional quantification'] } },
  neuro: { name: 'Neuro', index: '04', accent: '#17a9bc', file: 'AivaraNeuro', zh: { summary: '融合 PET/MR 影像，支持脑区分割与参考区定量。', features: ['PET/MR 三平面融合', '脑区自动分割', 'SUVR 参考区定量与三维皮层分区'] }, en: { summary: 'PET/MR fusion, brain segmentation, and reference-region quantification.', features: ['PET/MR tri-modal fusion', 'Brain region segmentation', 'SUVR reference-region analysis and 3D cortical parcellation'] } }
};

let language = localStorage.getItem('aivara-language') === 'en' ? 'en' : 'zh';
let activeProduct = 'onco';

function renderProduct() {
  const product = products[activeProduct];
  const copy = product[language];
  const suffix = language === 'zh' ? '中文' : 'English';
  document.getElementById('product-index').textContent = product.index;
  const title = document.getElementById('product-title');
  title.innerHTML = `Aivara<span>${product.name}</span>`;
  title.style.setProperty('--accent', product.accent);
  document.getElementById('product-summary').textContent = copy.summary;
  const list = document.getElementById('product-features');
  list.innerHTML = copy.features.map((feature) => `<li>${feature}</li>`).join('');
  list.style.setProperty('--accent', product.accent);
  const image = document.getElementById('product-image');
  image.src = `./assets/${product.file}_${suffix}.webp`;
  image.alt = translations[language].productAlt(`Aivara${product.name}`);
  document.querySelectorAll('.solution-tab').forEach((button) => {
    const selected = button.dataset.product === activeProduct;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function renderLanguage() {
  const copy = translations[language];
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = copy.title;
  document.querySelector('meta[name="description"]').content = copy.description;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.innerHTML = copy[element.dataset.i18n];
  });
  document.getElementById('suite-image').src = `./assets/All Suite_${language === 'zh' ? '中文' : 'English'}.webp`;
  document.getElementById('suite-image').alt = copy.suiteAlt;
  document.querySelectorAll('[data-lang]').forEach((button) => {
    const selected = button.dataset.lang === language;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderProduct();
}

document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => {
  language = button.dataset.lang;
  localStorage.setItem('aivara-language', language);
  renderLanguage();
}));
document.querySelectorAll('[data-product]').forEach((button) => button.addEventListener('click', () => {
  activeProduct = button.dataset.product;
  renderProduct();
}));
document.querySelector('.solution-tabs').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const keys = Object.keys(products);
  let index = keys.indexOf(activeProduct);
  if (event.key === 'ArrowRight') index = (index + 1) % keys.length;
  if (event.key === 'ArrowLeft') index = (index - 1 + keys.length) % keys.length;
  if (event.key === 'Home') index = 0;
  if (event.key === 'End') index = keys.length - 1;
  activeProduct = keys[index];
  renderProduct();
  document.querySelector(`[data-product="${activeProduct}"]`).focus();
});
renderLanguage();
