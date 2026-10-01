// Deeper audit: extreme sizes, English overflow, reduced motion, API outage, no-JS, keyboard, contrast, structure.
import { _electron as electron } from 'playwright-core';
import { readFileSync } from 'node:fs';
const T = process.env.CLAUDE_JOB_DIR + '/tmp/';
const URL = 'http://127.0.0.1:8766/';
const results = []; let failed = 0;
const check = (n, ok, d = '') => { results.push(`${ok ? 'ok  ' : 'FAIL'} ${n}${d ? ` — ${d}` : ''}`); if (!ok) failed++; };
const app = await electron.launch({ executablePath: process.env.ELECTRON, args: [T + 'blank.cjs', '--no-sandbox'] });
const page = await app.firstWindow();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const overflowing = () => page.evaluate(() => {
  const out = []; const W = document.documentElement.clientWidth;
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest('.cosmos')) return;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (r.width && (r.right > W + 1 || r.left < -1) && cs.position !== 'fixed') out.push((el.className || el.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    if (el.scrollWidth > el.clientWidth + 2 && ['visible', 'hidden', 'clip'].includes(cs.overflowX) && el.children.length === 0 && el.textContent.trim()) out.push('clipped text: ' + el.textContent.trim().slice(0, 30));
  });
  return out.slice(0, 6);
});
for (const lang of ['zh', 'en']) for (const [w, h, name] of [[320, 568, 'phone-320'], [844, 390, 'phone-landscape'], [768, 1024, 'ipad-portrait'], [2560, 1300, 'ultrawide']]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL); await page.evaluate(l => localStorage.setItem('tg.lang', l), lang); await page.goto(URL); await page.waitForTimeout(1600);
  const o = await overflowing();
  check(`${lang}/${name}: nothing sticks out or gets cut off`, o.length === 0, o.join(' | '));
  await page.screenshot({ path: `${T}audit-${lang}-${name}.png` });
}
// reduced motion: content fully visible, no animation needed
await page.setViewportSize({ width: 1280, height: 900 }); await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(URL); await page.waitForTimeout(1500);
const rm = await page.evaluate(() => ({ hidden: [...document.querySelectorAll('.card,.glass,.head')].filter(el => getComputedStyle(el).opacity < 0.99).length, title: getComputedStyle(document.querySelector('.reveal-title')).opacity }));
check('reduce motion: everything visible without animation', rm.hidden === 0 && rm.title === '1', JSON.stringify(rm));
await page.emulateMedia({ reducedMotion: 'no-preference' });
// scrolling down makes every section appear (no element stays invisible)
await page.goto(URL); await page.waitForTimeout(800);
for (let y = 0; y < 9000; y += 500) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
await page.waitForTimeout(1200);
const stuck = await page.evaluate(() => [...document.querySelectorAll('.rise')].filter(el => !el.classList.contains('in')).length);
check('after scrolling, every section has appeared', stuck === 0, String(stuck));
// explorer down: page still fine, panel shows a dash and an amber dot, no errors thrown
await page.route('https://explorer.tokel.io/**', r => r.abort());
const before = errors.length;
await page.goto(URL); await page.waitForTimeout(3000);
const down = await page.evaluate(() => [document.getElementById('liveHeight').textContent, document.getElementById('livePulse').className]);
check('explorer unreachable: panel degrades gracefully', down[0] === '—' && /idle/.test(down[1]), down.join(' '));
check('explorer unreachable: no page crash', errors.slice(before).filter(e => !/Failed to load resource|ERR_FAILED|net::/.test(e)).length === 0, errors.slice(before).join(' | '));
await page.unroute('https://explorer.tokel.io/**');
// keyboard only
await page.goto(URL); await page.waitForTimeout(600);
const seen = [];
for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); const f = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return [a.tagName, (a.textContent || '').trim().slice(0, 18), r.width > 0 && r.height > 0, getComputedStyle(a).outlineStyle !== 'none' || a.matches(':focus-visible')]; }); seen.push(f); }
check('Tab reaches buttons and links, each visibly focused', seen.filter(s => s[0] !== 'BODY').every(s => s[2] && s[3]), JSON.stringify(seen.filter(s => !(s[2] && s[3])).slice(0, 3)));
const tabbedTexts = new Set(seen.map(s => s[1]));
check('Tab reaches the language switch and the e-mail button', [...tabbedTexts].some(t => t === 'EN' || t === '中文') && [...tabbedTexts].some(t => /imperialtokel/.test(t)));
await page.setViewportSize({ width: 390, height: 844 }); await page.goto(URL); await page.waitForTimeout(500);
await page.focus('#menuBtn'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
const openK = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
const closedK = !(await page.evaluate(() => document.getElementById('navLinks').classList.contains('open')));
check('phone menu: Enter opens, Esc closes', openK && closedK);
// contrast of every text element against its own background (WCAG AA 4.5:1, large text 3:1)
for (const scheme of ['light', 'dark']) {
  await page.setViewportSize({ width: 1280, height: 900 }); await page.emulateMedia({ colorScheme: scheme }); await page.goto(URL); await page.waitForTimeout(1200);
  const low = await page.evaluate(() => {
    const parse = c => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = el => { const bi = getComputedStyle(el).backgroundImage; if (bi && bi.includes('gradient')) { const cs = bi.match(/rgba?\([^)]+\)/g).map(parse); return cs.reduce((a, c) => lum(c.slice(0,3)) > lum(a) ? c.slice(0,3) : a, [0,0,0]); } let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c.length === 3 || c[3] > 0.5) return c.slice(0, 3); e = e.parentElement; } return parse(getComputedStyle(document.body).backgroundColor).slice(0, 3); };
    const out = [];
    document.querySelectorAll('main p, main h2, main h3, main summary, main span, main a, footer p, .btn.primary, .eyebrow').forEach(el => {
      if (!el.textContent.trim() || (el.closest('.hero') && !el.matches('.btn,.eyebrow')) || el.children.length > 2) return;
      const cs = getComputedStyle(el); if (cs.color.includes('0, 0, 0, 0') || cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.backgroundClip === 'text') return;
      const fg = parse(cs.color).slice(0, 3), bg = bgOf(el);
      const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && +cs.fontWeight >= 700);
      if (ratio < (large ? 3 : 4.5)) out.push(el.textContent.trim().slice(0, 16) + ' ' + ratio.toFixed(2));
    });
    return out;
  });
  check(`${scheme}: text contrast meets WCAG AA`, low.length === 0, low.slice(0, 6).join(' | '));
}
// structure
await page.emulateMedia({ colorScheme: 'light' }); await page.goto(URL);
const st = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, order: [...document.querySelectorAll('h1,h2,h3')].map(h => +h.tagName[1]), imgNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length, ids: (() => { const s = new Set(), d = []; document.querySelectorAll('[id]').forEach(e => { if (s.has(e.id)) d.push(e.id); s.add(e.id); }); return d; })(), lang: document.documentElement.lang, viewport: !!document.querySelector('meta[name=viewport]'), desc: !!document.querySelector('meta[name=description]') }));
let jumps = 0; for (let i = 1; i < st.order.length; i++) if (st.order[i] - st.order[i - 1] > 1) jumps++;
check('one h1, no skipped heading levels', st.h1 === 1 && jumps === 0, JSON.stringify(st.order));
check('every image has alt text', st.imgNoAlt === 0);
check('no duplicate ids', st.ids.length === 0, st.ids.join(','));
check('page language, viewport and description set', st.lang && st.viewport && st.desc);
const man = JSON.parse(readFileSync('/home/zen/tokel/tokelgenesis.github.io/manifest.webmanifest', 'utf8'));
const iconSizes = await Promise.all(man.icons.map(async i => { const r = await page.request.get(URL + i.src); const b = await r.body(); return [i.sizes, r.status(), b.readUInt32BE(16) + 'x' + b.readUInt32BE(20)]; }));
check('manifest icons exist with the declared sizes', iconSizes.every(([s, code, real]) => code === 200 && s === real), JSON.stringify(iconSizes));
const sw = await page.request.get(URL + 'sw.js'); const swText = await sw.text();
const shell = [...swText.matchAll(/'([^']+\.(?:html|css|js|webmanifest|svg|png)(?:\?v=\d+)?)'/g)].map(m => m[1]);
const missing = []; for (const f of shell) { const r = await page.request.get(URL + f); if (r.status() !== 200) missing.push(f); }
check('every file the offline cache needs exists', missing.length === 0, missing.join(','));
check('no page errors overall', errors.filter(e => !/Failed to load resource|net::/.test(e)).length === 0, errors.slice(0, 4).join(' | '));
// without JavaScript: all content still readable
await app.close();
const app2 = await electron.launch({ executablePath: process.env.ELECTRON, args: [T + 'blank.cjs', '--no-sandbox'] });
const p2 = await app2.firstWindow();
await p2.context().route(/\.js(\?|$)/, r => r.abort());
await p2.goto(URL); await p2.waitForTimeout(800);
const nojs = await p2.evaluate(() => ({ visible: [...document.querySelectorAll('h1,h2,.card,.faq details')].filter(el => getComputedStyle(el).opacity > 0.9 && el.getBoundingClientRect().height > 0).length, total: document.querySelectorAll('h1,h2,.card,.faq details').length }));
check('without JavaScript every section is still readable', nojs.visible === nojs.total, JSON.stringify(nojs));
await app2.close();
console.log(results.join('\n')); console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
