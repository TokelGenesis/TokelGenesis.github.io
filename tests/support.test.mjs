// Tokel Genesis site: the OniU section, donation address and "buy TKL with USDT" form, against a fake OniU sale API
// (every call to https://app.oniu.uk is answered by this script). Run like site.test.mjs (see tests/README.md).
import { _electron as electron } from 'playwright-core';
const T = process.env.CLAUDE_JOB_DIR + '/tmp/';
const URL = 'http://127.0.0.1:8766/';
const results = []; let failed = 0;
const check = (n, ok, d = '') => { results.push(`${ok ? 'ok  ' : 'FAIL'} ${n}${d ? ` — ${d}` : ''}`); if (!ok) failed++; };

const DONATE = 'RJ9SyaC9tfXep6i3TqXfZwpQKPRabcDUZ1';
const PAYTO = '0xaab6dB722c8090b98b5937488CFF334A1618a8b0';
const BUYER = 'RWyHrShBQtcupU2PR61jPqTsQg6psxKQmy';
// the fake API: mode decides what it answers
const api = { mode: 'ok', orders: new Map(), calls: [], nextError: null };
function newOrder(address, tkl, extra = {}) {
  const id = Math.random().toString(36).slice(2, 14).replace(/[^a-z2-9]/g, 'a').padEnd(12, 'a').slice(0, 12);
  const o = { id, tkl: Math.round(Number(tkl) * 1e8), usdt: (Number(tkl) * 100).toFixed(2) + '0042', created: Date.now(), expires: Date.now() + 30 * 60_000, status: 'open', txid: null, address, ...extra };
  api.orders.set(id, o); return o;
}

const app = await electron.launch({ executablePath: process.env.ELECTRON, args: [T + 'blank.cjs', '--no-sandbox', '--disable-gpu'] });
const page = await app.firstWindow();
const errors = []; page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => { errors.push('dialog: ' + d.message()); d.dismiss(); }); // an alert() would mean injected script ran
await page.route('https://app.oniu.uk/**', async route => {
  const req = route.request(); const u = new globalThis.URL(req.url());
  api.calls.push(`${req.method()} ${u.pathname}${u.search}`);
  const cors = { 'access-control-allow-origin': 'http://127.0.0.1:8766', 'content-type': 'application/json' };
  const send = (status, body) => route.fulfill({ status, headers: cors, body: JSON.stringify(body) });
  if (api.mode === 'down') return route.abort('failed');
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type' } });
  if (u.pathname === '/api/public/sale') return api.mode === 'off' ? send(404, { error: 'SALE_OFF' }) : send(200, { price: 100, minSats: 5_000_000, maxSats: 1_000_000_000, payTo: PAYTO, confirmations: 20, ttlMs: 1_800_000 });
  if (u.pathname === '/api/public/sale/order' && req.method() === 'POST') {
    if (api.nextError) { const e = api.nextError; api.nextError = null; return send(e === 'RATE_LIMITED' ? 429 : 400, { error: e }); }
    const b = JSON.parse(req.postData() || '{}');
    return send(200, newOrder(b.address, b.tkl, api.extra || {}));
  }
  if (u.pathname === '/api/public/sale/order') {
    const o = api.orders.get(u.searchParams.get('id'));
    return o ? send(200, o) : send(404, { error: 'NOT_FOUND' });
  }
  return send(404, { error: 'NOT_FOUND' });
});
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim() ?? null, sel);
const visible = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length > 0; }, sel); // what is really on screen, not just the attribute
async function fresh(lang = 'en') { await page.goto(URL); await page.evaluate(l => { localStorage.clear(); if (l === 'zh') localStorage.setItem('tg.lang', 'zh'); }, lang); await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(600); }
async function buy(address, tkl) { await page.fill('#buyAddr', address); await page.fill('#buyAmt', tkl); await page.click('#buyGo'); await page.waitForTimeout(500); }

await page.setViewportSize({ width: 1280, height: 900 });
await fresh();

// ---- OniU section ----
const oniu = await page.evaluate(() => { const a = document.querySelector('#oniu a.btn'); return a && [a.href, a.target, a.rel]; });
check('OniU section links to app.oniu.uk in a new tab', oniu && oniu[0] === 'https://app.oniu.uk/' && oniu[1] === '_blank' && /noopener/.test(oniu[2]), JSON.stringify(oniu));
check('nav has OniU and Support', await page.evaluate(() => ['#oniu', '#support'].every(h => document.querySelector(`.links a[href="${h}"]`))));
check('safety note names app.oniu.uk as official', /app\.oniu\.uk/.test(await text('[data-i18n="safeText"]')));

// ---- donation ----
check('donation address shown exactly', await text('#donateAddr') === DONATE, await text('#donateAddr'));
await app.evaluate(({ clipboard }) => clipboard.writeText(''));
await page.click('#donate [data-copy]'); await page.waitForTimeout(300);
const clip = await app.evaluate(({ clipboard }) => clipboard.readText());
check('Copy puts the donation address on the clipboard', clip === DONATE, clip);
const menuBlocked = await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.getElementById('donateAddr').dispatchEvent(e); return e.defaultPrevented; });
check('long-press / right-click still works on the address (phones copy that way)', menuBlocked === false);
const menuElsewhere = await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('h1').dispatchEvent(e); return e.defaultPrevented; });
check('elsewhere the right-click menu stays blocked as before', menuElsewhere === true);

// ---- buying: form checks before anything is sent ----
check('buy form shown when the sale answers', await visible('#buyForm') && !(await visible('#buyOff')));
api.calls.length = 0;
await buy('R123', '1');
check('a malformed address is refused in the page, nothing sent', /not valid/.test(await text('#buyMsg')) && !api.calls.some(c => c.startsWith('POST')), await text('#buyMsg'));
for (const bad of ['0.01', '11', '1.1234567', 'abc', '']) {
  await buy(BUYER, bad);
  check(`amount "${bad}" refused in the page`, /0\.05 to 10/.test(await text('#buyMsg')), await text('#buyMsg'));
}
check('no order request was sent for any of them', !api.calls.some(c => c.startsWith('POST')), api.calls.join(','));
await page.fill('#buyAmt', '0.25'); await page.waitForTimeout(100);
check('cost preview: 0.25 TKL is about 25 USDT', /25 USDT/.test(await text('#buyCost')), await text('#buyCost'));

// ---- each server refusal shows a clear message ----
for (const [code, re] of [['BAD_ADDRESS', /not valid/], ['TOO_MANY_OPEN', /unpaid orders/], ['RATE_LIMITED', /Too many tries/], ['SALE_BUSY', /Many orders/], ['SALE_SOLD_OUT', /Not enough TKL/], ['WALLET_OFFLINE', /not reachable/], ['WEIRD<b>CODE', /went wrong \(WEIRDCODE\)/]]) {
  api.nextError = code; await buy(BUYER, '1');
  check(`server says ${code}: clear message`, re.test(await text('#buyMsg')), await text('#buyMsg'));
}

// ---- a real order ----
await buy(BUYER, '0.25');
check('order shown, form hidden', await visible('#buyOrder') && !(await visible('#buyForm')));
const shown = await page.evaluate(() => [...document.querySelectorAll('#buyOrder .kv')].map(k => [k.querySelector('.k').textContent, k.querySelector('code').textContent]));
const amount = shown.find(r => /exactly/.test(r[0]))?.[1];
check('exact USDT amount shown', amount === '25.000042', JSON.stringify(shown));
check('pay-to address is the one from the server', shown.some(r => r[1] === PAYTO));
check('the buyer\'s TKL address is shown back', shown.some(r => r[1] === BUYER));
check('countdown shown', /^\d+:\d\d$/.test(shown.find(r => /within/i.test(r[0]))?.[1] || ''), JSON.stringify(shown));
check('warning about exchange fees shown', /exchange/i.test(await text('#buyOrder .warn')));
await page.click('#buyOrder .kv:first-of-type [data-copy]').catch(() => {});
await page.evaluate(() => [...document.querySelectorAll('#buyOrder .kv')].find(k => /exactly/.test(k.textContent)).querySelector('button').click());
await page.waitForTimeout(300);
check('Copy on the amount copies just the number', await app.evaluate(({ clipboard }) => clipboard.readText()) === '25.000042');
const id = [...api.orders.keys()].pop();
check('order id remembered in this browser', await page.evaluate(() => JSON.parse(localStorage.getItem('tg.buy') || '[]')[0]) === id);

// language switch re-renders the order
await page.click('#langBtn'); await page.waitForTimeout(300);
check('Chinese: order texts switch too', /等待你的付款/.test(await text('#buyOrder .order-status')) && /請轉帳剛好/.test(await page.evaluate(() => document.querySelector('#buyOrder').textContent)));
await page.click('#langBtn'); await page.waitForTimeout(300);

// reload: the unfinished order comes back
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
check('after reload the unfinished order is shown again', await visible('#buyOrder') && /Waiting/.test(await text('#buyOrder .order-status')));

// paid, then sent: "check now" picks it up and shows the transaction link
api.orders.get(id).status = 'paid';
await page.click('#buyOrder .order-actions .btn'); await page.waitForTimeout(800);
check('paid: status updates', /Payment received/.test(await text('#buyOrder .order-status')), await text('#buyOrder .order-status'));
Object.assign(api.orders.get(id), { status: 'sent', txid: 'ab'.repeat(32) });
await page.click('#buyOrder .order-actions .btn'); await page.waitForTimeout(800);
const link = await page.evaluate(() => { const a = document.querySelector('#buyOrder a'); return a && [a.href, a.target, a.rel]; });
check('sent: done, with an explorer link to the transaction', /Done/.test(await text('#buyOrder .order-status')) && link?.[0] === 'https://explorer.tokel.io/tx/' + 'ab'.repeat(32) && /noopener/.test(link[2]), JSON.stringify(link));
await page.click('#buyOrder .order-actions .btn'); await page.waitForTimeout(300);
check('New order: back to the form, finished order forgotten', await visible('#buyForm') && await page.evaluate(i => !JSON.parse(localStorage.getItem('tg.buy') || '[]').includes(i), id));

// expired while the page is open
api.extra = { expires: Date.now() + 2500 };
await buy(BUYER, '1'); api.extra = null;
await page.waitForTimeout(4000);
check('countdown ends: shown as late, with the 24-hour note', /late/.test(await text('#buyOrder .order-status')) && /24 hours/.test(await page.evaluate(() => document.querySelector('#buyOrder').textContent)), await text('#buyOrder .order-status'));

// ---- hostile server answers are shown as text, never run ----
api.extra = { address: '<img src=x onerror="alert(1)">', usdt: '<script>alert(2)</script>' };
await page.click('#buyOrder .order-actions .btn:last-child'); await page.waitForTimeout(200);
await buy(BUYER, '1'); api.extra = null; await page.waitForTimeout(500);
check('HTML in server answers is shown as text (no script ran, no element made)', !errors.some(e => /dialog/.test(e)) && await page.evaluate(() => !document.querySelector('#buyOrder img, #buyOrder script')));
api.orders.get([...api.orders.keys()].pop()).txid = 'javascript:alert(3)';
api.orders.get([...api.orders.keys()].pop()).status = 'sent';
await page.click('#buyOrder .order-actions .btn'); await page.waitForTimeout(600);
check('a bad txid never becomes a link', await page.evaluate(() => !document.querySelector('#buyOrder a')));

// ---- sale switched off / unreachable ----
for (const mode of ['off', 'down']) {
  api.mode = mode; await fresh(); api.mode = 'ok';
  check(`sale ${mode}: form hidden, friendly note pointing to OniU shown`, !(await visible('#buyForm')) && await visible('#buyOff') && /OniU/.test(await text('#buyOff')));
}

// ---- phone layout and dark mode ----
for (const scheme of ['light', 'dark']) {
  await page.setViewportSize({ width: 360, height: 780 }); await page.emulateMedia({ colorScheme: scheme });
  await fresh();
  await buy(BUYER, '10');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`phone ${scheme}: no sideways scroll with an order shown`, over <= 1, `${over}px`);
  const cut = await page.evaluate(() => [...document.querySelectorAll('#support code, #support .btn')].filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 || r.left < -1; }).map(e => e.textContent.slice(0, 20)));
  check(`phone ${scheme}: addresses and buttons fit the screen`, cut.length === 0, cut.join(','));
  await page.locator('#support').scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  check(`phone ${scheme}: only the order is shown, not the form`, await visible('#buyOrder') && !(await visible('#buyForm')));
  await page.locator('#support').screenshot({ path: `${T}tg-support-phone-${scheme}.png` });
}
await page.setViewportSize({ width: 1280, height: 900 }); await page.emulateMedia({ colorScheme: 'light' }); await fresh('zh');
await page.locator('#oniu').scrollIntoViewIfNeeded(); await page.waitForTimeout(1200); await page.locator('#oniu').screenshot({ path: `${T}tg-oniu-zh.png` });
await page.locator('#support').scrollIntoViewIfNeeded(); await page.waitForTimeout(1200); await page.locator('#support').screenshot({ path: `${T}tg-support-zh.png` });
const zhLeft = await page.evaluate(() => [...document.querySelectorAll('#oniu [data-i18n], #support [data-i18n]')].filter(e => !/[一-鿿]/.test(e.textContent) && e.textContent.trim() && !/^OniU$/.test(e.textContent.trim())).map(e => e.getAttribute('data-i18n')));
check('Chinese: every new text is translated', zhLeft.length === 0, zhLeft.join(','));
const emdash = await page.evaluate(() => document.body.innerHTML.includes('—'));
check('no em dash anywhere on the page', !emdash);

check('no page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await app.close();
console.log(results.join('\n'));
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
