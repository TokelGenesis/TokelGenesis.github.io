// Tokel Genesis: language switch (zh-TW / EN, remembered), phone menu, copy e-mail, offline install (PWA).
(function () {
  'use strict';

  var EN = {
    navChapter: 'New chapter', navHolders: 'For holders', navWhy: 'Why Tokel', navStart: 'Get started', navFaq: 'FAQ',
    heroTitle1: 'Genesis', heroTitle2: 'A new chapter',
    heroLead: 'Create tokens and NFTs easily, for everyone. No complicated smart contracts. Same chain, same TKL, carried forward by its community.',
    heroStart: 'Get started', heroHolders: 'I already hold TKL',
    factBlock: 'block time', factPow: 'Equihash mining', factSupply: 'max TKL supply', factTech: 'built on',
    chapterKicker: 'COMMUNITY CONTINUATION', chapterTitle: 'A new beginning that keeps everything',
    holdersKicker: 'FOR EXISTING HOLDERS', holdersTitle: 'Your TKL is still here',
    h1t: 'Same chain', h1d: 'The chain is producing blocks again, continuing right after the original blocks. Every past transaction is intact.',
    h2t: 'Same TKL', h2d: 'Nothing to convert, swap or claim. Your addresses, balances, tokens and NFTs are exactly as before.',
    h3t: 'Wallets still work', h3d: 'Your existing seed phrase and keys work as always. Only enter them in a wallet you trust; nobody will ever ask you for them.',
    liveTitle: 'Live on-chain data', liveHeight: 'block height', liveAge: 'since last block', liveDiff: 'mining difficulty', livePeers: 'node connections',
    safeTitle: 'Stay safe', safeText: 'Tokel Genesis will never ask for your seed phrase or private keys, and there is no "migration", "claim" or "airdrop". The only official places are this website, TokelGenesis on GitHub, and imperialtokel@gmail.com.',
    holdersCheck: 'Want to check your balance? Enter your TKL address in the block explorer.', openExplorer: 'Open the explorer',
    whyKicker: 'WHY TOKEL', whyTitle: 'Tokens and NFTs, native on-chain',
    w1t: 'No smart contracts needed', w1d: 'Tokens and NFTs are created by the chain itself (Komodo Antara modules): no contract code to write and no contract bugs to fear.',
    w2t: 'Tiny fees', w2d: 'No gas bidding wars. Issuing and sending cost a tiny amount of TKL, affordable for anyone.',
    w3t: 'Proof of work', w3d: 'Equihash mining with 60-second blocks, plus checkpoints and deep-reorg protection for a safer network.',
    w4t: 'Open source, maintained', w4d: 'Node, wallet, light-client library and explorer are all open source, with security fixes and dependency upgrades done.',
    startKicker: 'GET STARTED', startTitle: 'Pick what you need',
    s1t: 'Desktop wallet', s1d: 'Windows, Mac, Linux. The original v1.4.0 is available now; a security-hardened release is coming.', s1go: 'Download →',
    s2t: 'Block explorer', s2d: 'Look up addresses, transactions, blocks and tokens.', s2go: 'Open →',
    s3t: 'Run a node and mine', s3d: 'Run your own full node and mine with a CPU to help secure the network.', s3go: 'Read the guide →',
    s4t: 'Developers', s4d: 'nSPV light-client library: check balances and sign transactions in apps and web pages.', s4go: 'GitHub →',
    s5t: 'Documentation', s5d: 'Creating tokens and NFTs, chain parameters and API (original team documentation).', s5go: 'Read →',
    s6t: 'Get involved', s6d: 'Report issues, suggest improvements, become a maintainer. The community grows from here.', s6go: 'Join →',
    legacyKicker: 'IN GRATITUDE', legacyTitle: 'Thank you, original TokelPlatform team',
    legacyText: 'You built this chain, these tools and a community that believed in it. Tokel Genesis will carry that work forward with care.',
    legacyLink: 'Original project: TokelPlatform',
    faqKicker: 'FAQ', faqTitle: 'You might be wondering',
    q1: 'Is Tokel Genesis the official TokelPlatform?', a1: 'No. It is a community continuation: the same chain and the original code (with all authorship and history kept), with ongoing fixes and updates.',
    q2: 'What do I need to do to keep my TKL?', a2: 'Nothing. Your TKL, tokens and NFTs stay at your addresses. Be careful with any message asking you to "migrate" or "claim": those are scams.',
    q3: 'Why did the chain stop?', a3: 'After the original team stopped operating, nobody kept mining, so blocks stopped. Mining has resumed and the chain is producing blocks normally; no data changed.',
    q4: 'Can I mine?', a4: 'Yes. Tokel uses Equihash and can be mined with an ordinary computer\'s CPU. See "Run a node and mine".',
    q5: 'Why doesn\'t tokel.io open?', a5: 'It is the original team\'s domain and its server has stopped. The new home of Tokel Genesis is this site and TokelGenesis on GitHub.',
    q6: 'How do I contact you?', a6: 'Email imperialtokel@gmail.com, or open an issue on GitHub.',
    contactTitle: 'Contact us', contactText: 'Partnerships, bug reports or joining as a maintainer: all welcome.',
    copied: 'Email copied',
    community: 'Original community channels: <a href="https://discord.gg/R9u43zYZka" target="_blank" rel="noopener">Discord</a>・<a href="https://t.me/TokelPlatformchat" target="_blank" rel="noopener">Telegram</a>・<a href="https://twitter.com/TokelPlatform" target="_blank" rel="noopener">X</a>',
    footNote: 'A community continuation of TokelPlatform. Open source, free, community-maintained.'
  };

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var ZH = {};
  nodes.forEach(function (el) { ZH[el.getAttribute('data-i18n')] = el.innerHTML; });

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
  if (!saved) saved = /^zh/i.test(navigator.language || 'zh') ? 'zh' : 'en';
  if (saved === 'en') setLang('en');
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
