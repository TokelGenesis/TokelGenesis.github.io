// Tokel Genesis site: clicks every control, checks every link, three device sizes, light/dark, both languages.
import { _electron as electron } from 'playwright-core';
const T = process.env.CLAUDE_JOB_DIR + '/tmp/';
const URL = 'http://127.0.0.1:8766/';
const results = []; let failed = 0;
const check = (n, ok, d = '') => { results.push(`${ok ? 'ok  ' : 'FAIL'} ${n}${d ? ` — ${d}` : ''}`); if (!ok) failed++; };
const app = await electron.launch({ executablePath: process.env.ELECTRON, args: [T + 'blank.cjs', '--no-sandbox', '--disable-gpu'] });
const page = await app.firstWindow();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => errors.push('failed ' + r.url()));
for (const [w, h, name] of [[1440, 900, 'desktop'], [1024, 1366, 'ipad'], [390, 844, 'iphone']]) {
  for (const scheme of ['light', 'dark']) {
    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(URL); await page.evaluate(() => { try { localStorage.setItem('tg.lang', 'zh'); } catch (e) {} }); await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(700);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${name}/${scheme}: no sideways scroll`, over <= 1, `${over}px`);
    await page.screenshot({ path: `${T}tg-${name}-${scheme}.png`, fullPage: true });
  }
}
// every in-page anchor points at a real section
await page.setViewportSize({ width: 1440, height: 900 }); await page.emulateMedia({ colorScheme: 'light' }); await page.goto(URL); await page.evaluate(() => localStorage.setItem('tg.lang', 'zh')); await page.goto(URL);
const anchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => [a.textContent.trim(), a.getAttribute('href'), !!document.querySelector(a.getAttribute('href'))]));
await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.goto(URL); await page.waitForTimeout(500);
const first = await page.evaluate(() => [document.documentElement.lang, document.querySelector('[data-i18n="heroStart"]').textContent, document.getElementById('langBtn').textContent, document.querySelector('.reveal-title').textContent.replace(/\u00a0/g, ' ')]);
check('a new visitor sees English first', first[0] === 'en' && first[1] === 'Get started' && first[2] === '中文', first.join(' | '));
check('English title keeps its spaces', /A new chapter/.test(first[3]), first[3]);
await page.evaluate(() => localStorage.setItem('tg.lang', 'zh')); await page.goto(URL);
check('every in-page link has its section', anchors.every(a => a[2]), JSON.stringify(anchors.filter(a => !a[2])));
// clicking each nav link scrolls to the section
for (const [text, href] of anchors.filter(a => a[1] !== '#top')) {
  await page.goto(URL); await page.click(`.links a[href="${href}"]`, { timeout: 2000 }).catch(() => page.click(`a[href="${href}"]`));
  await page.evaluate(async () => { // until smooth scrolling has started and stopped (a longer page takes longer)
    await new Promise(r => setTimeout(r, 300));
    for (let i = 0; i < 40; i++) { const y = scrollY; await new Promise(r => setTimeout(r, 120)); if (scrollY === y) break; }
  });
  const top = await page.evaluate(h => Math.round(document.querySelector(h).getBoundingClientRect().top), href);
  check(`click "${text}" scrolls to ${href}`, top >= -5 && top < 160, `section top ${top}px`);
}
// external links open in a new tab and are safe
const ext = await page.evaluate(() => [...document.querySelectorAll('a[href^="http"]')].map(a => [a.href, a.target, a.rel]));
check('external links open in a new tab with rel=noopener', ext.every(e => e[1] === '_blank' && /noopener/.test(e[2])), JSON.stringify(ext.filter(e => !(e[1] === '_blank' && /noopener/.test(e[2])))));
// language switch, remembered after reload
await page.goto(URL); await page.click('#langBtn'); await page.waitForTimeout(300);
const en = await page.evaluate(() => [document.documentElement.lang, document.querySelector('[data-i18n="heroStart"]').textContent, document.getElementById('langBtn').textContent]);
check('EN switch translates the page', en[0] === 'en' && en[1] === 'Get started' && en[2] === '中文', en.join(' | '));
const untranslated = await page.evaluate(() => [...document.querySelectorAll('[data-i18n]')].filter(el => /[一-鿿]/.test(el.textContent)).map(el => el.getAttribute('data-i18n')));
check('EN: no Chinese left in translated parts', untranslated.length === 0, untranslated.join(','));
await page.reload(); await page.waitForTimeout(400);
check('language choice remembered after reload', await page.evaluate(() => document.documentElement.lang) === 'en');
await page.screenshot({ path: `${T}tg-desktop-en.png` });
await page.click('#langBtn'); await page.waitForTimeout(300);
check('back to Chinese', await page.evaluate(() => document.querySelector('[data-i18n="heroStart"]').textContent) === '開始使用');
// FAQ: every question opens and closes
const n = await page.locator('.faq summary').count();
let opened = 0; for (let i = 0; i < n; i++) { await page.locator('.faq summary').nth(i).click(); if (await page.locator('.faq details').nth(i).evaluate(d => d.open)) opened++; }
check(`all ${n} FAQ answers open`, opened === n, `${opened}/${n}`);
// copy e-mail button
await app.evaluate(({ session }) => {});
await page.click('#copyMail'); await page.waitForTimeout(400);
const clip = await app.evaluate(({ clipboard }) => clipboard.readText());
check('copy e-mail button copies imperialtokel@gmail.com', clip === 'imperialtokel@gmail.com', clip);
check('"copied" note shows', await page.isVisible('#copied'));
// phone menu
await page.setViewportSize({ width: 390, height: 844 }); await page.goto(URL); await page.waitForTimeout(400);
check('phone: menu button visible, links hidden', await page.isVisible('#menuBtn') && !(await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'))));
await page.click('#menuBtn'); await page.waitForTimeout(350);
check('phone: menu opens', await page.evaluate(() => document.getElementById('navLinks').classList.contains('open')));
await page.screenshot({ path: `${T}tg-iphone-menu.png` });
await page.click('.links a[href="#faq"]'); { let prev = -1; for (let k = 0; k < 30; k++) { await page.waitForTimeout(200); const y = await page.evaluate(() => scrollY); if (y === prev) break; prev = y; } }
const st = await page.evaluate(() => [document.getElementById('navLinks').classList.contains('open'), Math.round(document.querySelector('#faq').getBoundingClientRect().top), window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2]);
check('phone: choosing a section closes the menu and goes there', !st[0] && (Math.abs(st[1]) < 160 || st[2]), JSON.stringify(st));
await page.click('#menuBtn'); await page.waitForTimeout(300); await page.mouse.click(200, 700); await page.waitForTimeout(300);
check('phone: tapping outside closes the menu', !(await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'))));
// tap targets big enough on phone (Apple: 44px)
const small = await page.evaluate(() => [...document.querySelectorAll('a.btn, button, .card.link, .faq summary')].filter(el => el.offsetParent && el.getBoundingClientRect().height < 40).map(el => el.textContent.trim().slice(0, 20)));
check('phone: every button is at least 40px tall', small.length === 0, small.join(','));
await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(URL);
const blocked = await page.evaluate(() => {
  const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('h1').dispatchEvent(ev);
  const k = (key, o) => { const e = new KeyboardEvent('keydown', Object.assign({ key, bubbles: true, cancelable: true }, o)); document.dispatchEvent(e); return e.defaultPrevented; };
  return { rightClick: ev.defaultPrevented, f12: k('F12', {}), ctrlU: k('u', { ctrlKey: true }), devtools: k('i', { ctrlKey: true, shiftKey: true }), normalTyping: !k('a', {}) };
});
check('right-click menu blocked', blocked.rightClick);
check('F12 / Ctrl+U / Ctrl+Shift+I blocked', blocked.f12 && blocked.ctrlU && blocked.devtools, JSON.stringify(blocked));
check('ordinary keys still work', blocked.normalTyping);
const icons = await page.evaluate(() => [...document.querySelectorAll('.card .ic svg')].length);
check('all 9 card icons are drawn (no emoji boxes)', icons === 9, String(icons));
await page.goto(URL); await page.waitForTimeout(4500);
const fx = await page.evaluate(() => {
  const c = document.getElementById('starfield'); const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) lit++;
  return { canvasLit: lit, letters: document.querySelectorAll('.reveal-title .ch').length, height: document.getElementById('liveHeight').textContent, age: document.getElementById('liveAge').textContent, diff: document.getElementById('liveDiff').textContent };
});
check('starfield is drawing', fx.canvasLit > 100, String(fx.canvasLit));
check('title letters animate in', fx.letters >= 6, String(fx.letters));
check('live block height shown from the explorer', /^\d{1,3}(,\d{3})+$/.test(fx.height), fx.height);
check('time since last block shown', /\d/.test(fx.age), fx.age);
check('mining difficulty shown', /\d/.test(fx.diff), fx.diff);
check('no page errors / failed requests', errors.length === 0, errors.slice(0, 5).join(' | '));
console.log(results.join('\n')); console.log(`${results.length - failed}/${results.length} passed`);
await app.close(); process.exit(failed ? 1 : 0);
