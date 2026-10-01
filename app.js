// Tokel Genesis: language switch (English first, 繁體中文 on request, remembered), phone menu, copy e-mail, offline install (PWA).
(function () {
  'use strict';

  var ZH = {
    navChapter: '新篇章',
    navHolders: '給持有者',
    navWhy: '為什麼是 Tokel',
    navStart: '開始使用',
    navFaq: '常見問題',
    heroTitle1: '創世紀',
    heroTitle2: '新篇章',
    heroLead: '讓每個人都能輕鬆發行代幣與 NFT。沒有複雜的智能合約，同一條鏈、同一個 TKL，由社群延續前進。',
    heroStart: '開始使用',
    heroHolders: '我是原本的持有者',
    factBlock: '出塊時間',
    factPow: 'Equihash 挖礦',
    factSupply: 'TKL 總量上限',
    factTech: '底層技術',
    liveTitle: '即時鏈上數據',
    liveHeight: '區塊高度',
    liveAge: '距上一個區塊',
    liveDiff: '挖礦難度',
    livePeers: '節點連線',
    chapterKicker: '社群延續',
    chapterTitle: '一個新的開始，延續原本的一切',
    holdersKicker: '給原本的持有者',
    holdersTitle: '你的 TKL 都還在',
    h1t: '同一條鏈',
    h1d: '區塊鏈已恢復出塊，高度延續原本的區塊之後。所有歷史交易都完整保留。',
    h2t: '同一個 TKL',
    h2d: '不需要轉換、兌換或領取。你的地址、餘額、代幣與 NFT 都和以前一樣。',
    h3t: '錢包相容',
    h3d: '原本的助記詞與私鑰照常使用。請只在你信任的錢包輸入，任何人都不會向你索取助記詞。',
    safeTitle: '安全提醒',
    safeText: 'Tokel Genesis 永遠不會向你索取助記詞或私鑰，也沒有任何「遷移」「領取」「空投」活動。官方只有這個網站、GitHub 上的 TokelGenesis，以及 imperialtokel@gmail.com。',
    holdersCheck: '想確認餘額？在區塊瀏覽器輸入你的 TKL 地址即可查看。',
    openExplorer: '開啟區塊瀏覽器',
    whyKicker: '為什麼是 Tokel',
    whyTitle: '代幣與 NFT，原生在鏈上',
    w1t: '不需要智能合約',
    w1d: '代幣與 NFT 由鏈本身的功能建立（Komodo Antara 模組），不用寫合約，也沒有合約漏洞的風險。',
    w2t: '手續費極低',
    w2d: '沒有 Gas 競價。發行與轉帳的費用以極小的 TKL 計算，人人負擔得起。',
    w3t: '工作量證明',
    w3d: 'Equihash 挖礦、60 秒出塊，並加入檢查點與深度重組保護，強化網路安全。',
    w4t: '開源、持續維護',
    w4d: '節點、錢包、輕節點函式庫與瀏覽器全部開源，並已完成安全更新與相依套件升級。',
    startKicker: '開始使用',
    startTitle: '選擇你需要的',
    s1t: '桌面錢包',
    s1d: 'Windows、Mac、Linux。目前提供原版 v1.4.0；安全強化版即將發布。',
    s1go: '下載 →',
    s2t: '區塊瀏覽器',
    s2d: '查詢地址、交易、區塊與代幣。',
    s2go: '開啟 →',
    s3t: '運行節點與挖礦',
    s3d: '自己跑一個全節點，用 CPU 參與挖礦，一起守護網路。',
    s3go: '查看說明 →',
    s4t: '開發者',
    s4d: 'nSPV 輕節點函式庫：在 App 或網頁中查詢餘額、簽名交易。',
    s4go: 'GitHub →',
    s5t: '技術文件',
    s5d: '建立代幣與 NFT、鏈的參數與 API 說明（原團隊文件）。',
    s5go: '閱讀 →',
    s6t: '一起參與',
    s6d: '回報問題、提出改進、成為維護者。社群從這裡慢慢長大。',
    s6go: '加入 →',
    legacyKicker: '致敬',
    legacyTitle: '謝謝原 TokelPlatform 團隊',
    legacyText: '你們建立了這條鏈、這些工具，以及一群相信它的人。Tokel Genesis 會把這份心血好好延續下去。',
    legacyLink: '原始專案 TokelPlatform',
    faqKicker: '常見問題',
    faqTitle: '你可能想知道',
    q1: 'Tokel Genesis 是官方 TokelPlatform 嗎？',
    a1: '不是。它是社群延續：延用同一條鏈與原始程式碼（完整保留原作者與歷史），並持續修正與更新。',
    q2: '我需要做什麼才能保住我的 TKL？',
    a2: '什麼都不用做。你的 TKL、代幣與 NFT 都在原本的地址上。請小心任何要求你「遷移」或「領取」的訊息，那都是詐騙。',
    q3: '鏈為什麼曾經停止？',
    a3: '原團隊停止營運後，沒有人繼續挖礦，區塊就停了。現在有人持續挖礦，鏈已恢復正常出塊，資料完全沒有改變。',
    q4: '我可以參與挖礦嗎？',
    a4: '可以。Tokel 使用 Equihash，用一般電腦的 CPU 就能挖。請參考「運行節點與挖礦」的說明。',
    q5: 'tokel.io 怎麼打不開？',
    a5: '那是原團隊的網域，主機已停止服務。Tokel Genesis 的新家就是這個網站與 GitHub 上的 TokelGenesis。',
    q6: '如何聯絡你們？',
    a6: '寄信到 imperialtokel@gmail.com，或在 GitHub 上提出 Issue。',
    contactTitle: '聯絡我們',
    contactText: '合作、回報問題或想加入維護，都歡迎來信。',
    copied: '已複製信箱',
    community: '原社群頻道：<a href="https://discord.gg/R9u43zYZka" target="_blank" rel="noopener">Discord</a>・<a href="https://t.me/TokelPlatformchat" target="_blank" rel="noopener">Telegram</a>・<a href="https://twitter.com/TokelPlatform" target="_blank" rel="noopener">X</a>',
    footNote: 'TokelPlatform 的社群延續。開源、免費、由社群維護。'
  };

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var EN = {}; // the page is written in English; Chinese comes from ZH above
  nodes.forEach(function (el) { EN[el.getAttribute('data-i18n')] = el.innerHTML; });

  var langBtn = document.getElementById('langBtn');
  function setLang(lang) {
    var dict = lang === 'en' ? EN : ZH;
    nodes.forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v;
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant-TW';
    langBtn.textContent = lang === 'en' ? '中文' : 'EN';
    try { localStorage.setItem('tg.lang', lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('tg.lang'); } catch (e) {}
  if (saved === 'zh') setLang('zh'); // English first; Chinese only when chosen (and then remembered)
  langBtn.addEventListener('click', function () { setLang(document.documentElement.lang === 'en' ? 'zh' : 'en'); });

  // phone menu: opens/closes, and closes after choosing a section or tapping outside
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  function closeMenu() { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('click', function (e) { if (!navLinks.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // copy e-mail (mailto links often do nothing on phones without a mail app); fall back to mailto
  var MAIL = 'imperialtokel@gmail.com';
  var copyBtn = document.getElementById('copyMail');
  var copied = document.getElementById('copied');
  copyBtn.addEventListener('click', function () {
    function shown() { copied.hidden = false; setTimeout(function () { copied.hidden = true; }, 2200); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(MAIL).then(shown, function () { location.href = 'mailto:' + MAIL; });
    } else {
      location.href = 'mailto:' + MAIL;
    }
  });

  // no right-click menu, image dragging or common view-source shortcuts (a deterrent only: the page holds no secrets)
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG' || e.target.tagName === 'A') e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if (k === 'f12' || (mod && k === 'u') || (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) || (mod && e.altKey && (k === 'i' || k === 'u'))) e.preventDefault();
  });

  // installable and readable offline
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
