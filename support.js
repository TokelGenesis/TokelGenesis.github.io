// Tokel Genesis: copy buttons, and buying TKL with USDT through OniU's public sale API (app.oniu.uk).
// The order is made by OniU's server; this page only shows it. Server text is always inserted as text, never as HTML.
(function () {
  'use strict';

  var API = 'https://app.oniu.uk/api/public/sale';
  var EXPLORER_TX = 'https://explorer.tokel.io/tx/';
  var KEEP = 'tg.buy'; // this browser's recent order ids, so a buyer can come back to an order

  var T = {
    en: {
      copy: 'Copy', copied: 'Copied',
      cost: 'You pay about {usdt} USDT (the exact amount comes with the order).',
      sendExactly: 'Send exactly', to: 'To this address', network: 'Network', networkValue: 'BNB Smart Chain (BEP20), token USDT',
      tklTo: 'TKL goes to', orderNo: 'Order number (keep it)', within: 'Pay within', timeUp: 'Time is up for this order. A payment made within 24 hours of ordering still counts.',
      exact: 'The amount that arrives must match to the last digit: it is how your payment is recognised. Exchanges often subtract a withdrawal fee, so send from a wallet such as MetaMask or Trust Wallet, or make sure the exchange sends the full amount.',
      st_open: 'Waiting for your payment', st_expired: 'Waiting for your payment (late)', st_paid: 'Payment received. Sending your TKL…', st_sent: 'Done: your TKL has been sent.',
      viewTx: 'View the transaction', checkNow: 'I have paid: check now', newOrder: 'New order', checking: 'Checking…', checkedAt: 'Last checked {time}. This page checks again by itself.',
      e_BAD_ADDRESS: 'That TKL address is not valid. Copy it again from your wallet (it starts with R).',
      e_BAD_AMOUNT: 'Enter an amount from 0.05 to 10 TKL, with at most 6 decimals.',
      e_TOO_MANY_OPEN: 'You already have unpaid orders. Pay one of them or wait 30 minutes.',
      e_RATE_LIMITED: 'Too many tries. Please wait a little and try again.',
      e_SALE_BUSY: 'Many orders are waiting right now. Please try again in a few minutes.',
      e_SALE_SOLD_OUT: 'Not enough TKL is available for that amount right now. Try a smaller amount or later.',
      e_WALLET_OFFLINE: 'The wallet server is not reachable right now. Please try again later.',
      e_SALE_OFF: 'Buying here is switched off right now.',
      e_NOT_FOUND: 'This order was not found.',
      e_NET: 'Could not reach OniU. Check your connection and try again.',
      e_OTHER: 'Something went wrong ({code}). Please try again.'
    },
    zh: {
      copy: '複製', copied: '已複製',
      cost: '大約需付 {usdt} USDT（確切金額會在訂單中顯示）。',
      sendExactly: '請轉帳剛好', to: '到這個地址', network: '網路', networkValue: 'BNB 智能鏈（BEP20），代幣 USDT',
      tklTo: 'TKL 會送到', orderNo: '訂單編號（請保留）', within: '請在時間內付款', timeUp: '這筆訂單已超過付款時間。下單後 24 小時內的付款仍然有效。',
      exact: '到帳金額必須連最後一位都相同，系統靠這個金額認出你的付款。交易所提領常會扣手續費，請用 MetaMask、Trust Wallet 等錢包付款，或確認交易所會送出完整金額。',
      st_open: '等待你的付款', st_expired: '等待你的付款（已逾時）', st_paid: '已收到付款，正在送出 TKL…', st_sent: '完成：TKL 已送出。',
      viewTx: '查看交易', checkNow: '我已付款，立即查詢', newOrder: '新訂單', checking: '查詢中…', checkedAt: '最後查詢 {time}。本頁會自動再查詢。',
      e_BAD_ADDRESS: '這個 TKL 地址無效。請從你的錢包重新複製（R 開頭）。',
      e_BAD_AMOUNT: '請輸入 0.05 到 10 TKL，最多 6 位小數。',
      e_TOO_MANY_OPEN: '你已有未付款的訂單。請先付款，或等 30 分鐘。',
      e_RATE_LIMITED: '嘗試次數太多，請稍候再試。',
      e_SALE_BUSY: '目前等待付款的訂單很多，請幾分鐘後再試。',
      e_SALE_SOLD_OUT: '目前可供應的 TKL 不足這個數量，請改小一點或稍後再試。',
      e_WALLET_OFFLINE: '錢包伺服器暫時無法連線，請稍後再試。',
      e_SALE_OFF: '目前暫停在這裡購買。',
      e_NOT_FOUND: '找不到這筆訂單。',
      e_NET: '無法連上 OniU，請檢查網路後再試。',
      e_OTHER: '發生問題（{code}），請再試一次。'
    }
  };
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'zh'; }
  function t(key, vars) {
    var s = T[lang()][key] || T.en[key] || key;
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- copy buttons (any [data-copy] names the element whose text to copy) ---------- */
  function copyText(text, btn) {
    function done() { var old = btn.textContent; btn.textContent = t('copied'); setTimeout(function () { btn.textContent = old; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { selectIn(btn); });
    else selectIn(btn);
  }
  function selectIn(btn) { // no clipboard access: select the text so the phone's own copy menu works
    var target = document.getElementById(btn.getAttribute('data-copy')) || btn.previousElementSibling;
    if (!target) return;
    var r = document.createRange(); r.selectNodeContents(target);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    var src = document.getElementById(b.getAttribute('data-copy'));
    if (src) copyText(src.textContent.trim(), b);
  });

  /* ---------- buying ---------- */
  var form = document.getElementById('buyForm');
  if (!form) return;
  var addrIn = document.getElementById('buyAddr');
  var amtIn = document.getElementById('buyAmt');
  var cost = document.getElementById('buyCost');
  var msg = document.getElementById('buyMsg');
  var go = document.getElementById('buyGo');
  var box = document.getElementById('buyOrder');
  var off = document.getElementById('buyOff');
  var info = null, current = null, pollTimer = null, tickTimer = null, lastCheck = null, busy = false;

  var AMOUNT = /^(?:\d{1,2})(?:\.\d{1,6})?$/;
  var ADDRESS = /^R[1-9A-HJ-NP-Za-km-z]{33}$/;

  function api(method, path, body) {
    var opts = { method: method, mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' };
    if (body) { opts.headers = { 'content-type': 'application/json' }; opts.body = JSON.stringify(body); }
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j || {} }; });
    }, function () { return { ok: false, status: 0, body: { error: 'NET' } }; });
  }
  function errorText(code) { return T.en['e_' + code] ? t('e_' + code) : t('e_OTHER', { code: String(code).replace(/[^A-Z_]/g, '').slice(0, 30) || '?' }); }
  function showMsg(text, bad) { msg.textContent = text || ''; msg.classList.toggle('bad', !!bad); }

  function updateCost() {
    var v = amtIn.value.trim();
    cost.textContent = AMOUNT.test(v) && Number(v) > 0 ? t('cost', { usdt: (Math.round(Number(v) * 100 * 1e6) / 1e6).toString() }) : '';
  }
  amtIn.addEventListener('input', updateCost);

  function remember(id) {
    try { var a = JSON.parse(localStorage.getItem(KEEP) || '[]').filter(function (x) { return x !== id; }); a.unshift(id); localStorage.setItem(KEEP, JSON.stringify(a.slice(0, 5))); } catch (e) {}
  }
  function forget(id) {
    try { localStorage.setItem(KEEP, JSON.stringify(JSON.parse(localStorage.getItem(KEEP) || '[]').filter(function (x) { return x !== id; }))); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    if (!info) { showMsg(errorText('NET'), true); return; }
    var address = addrIn.value.trim(), tkl = amtIn.value.trim();
    if (!ADDRESS.test(address)) { showMsg(errorText('BAD_ADDRESS'), true); addrIn.focus(); return; }
    if (!AMOUNT.test(tkl) || Number(tkl) < 0.05 || Number(tkl) > 10) { showMsg(errorText('BAD_AMOUNT'), true); amtIn.focus(); return; }
    busy = true; go.disabled = true; showMsg(t('checking'));
    api('POST', '/order', { address: address, tkl: tkl }).then(function (r) {
      busy = false; go.disabled = false;
      if (!r.ok || !r.body.id) { showMsg(errorText(r.body.error || 'NET'), true); return; }
      showMsg('');
      remember(r.body.id);
      show(r.body);
    });
  });

  function row(label, value, copyable) {
    var d = el('div', 'kv');
    d.appendChild(el('span', 'k', label));
    var v = el('code', 'v', value);
    var id = 'o' + Math.random().toString(36).slice(2, 9); v.id = id;
    d.appendChild(v);
    if (copyable) { var b = el('button', 'btn small', t('copy')); b.type = 'button'; b.setAttribute('data-copy', id); d.appendChild(b); }
    return d;
  }

  function render() {
    var o = current;
    box.textContent = '';
    if (!o) { box.hidden = true; form.hidden = false; return; }
    form.hidden = true; box.hidden = false;
    var st = el('p', 'order-status st-' + o.status, t('st_' + o.status) || o.status);
    st.setAttribute('role', 'status');
    box.appendChild(st);
    if (o.status === 'open' || o.status === 'expired') {
      box.appendChild(row(t('sendExactly'), o.usdt + ' USDT', true));
      box.lastChild.querySelector('code').textContent = o.usdt; // copy just the number
      box.lastChild.querySelector('code').setAttribute('data-unit', 'USDT');
      box.appendChild(row(t('to'), info ? info.payTo : '', true));
      box.appendChild(row(t('network'), t('networkValue'), false));
      if (o.status === 'open') box.appendChild(row(t('within'), countdown(o.expires), false)).id = 'buyLeft';
      else box.appendChild(el('p', 'tiny muted', t('timeUp')));
      box.appendChild(el('p', 'tiny warn', t('exact')));
    }
    box.appendChild(row(t('tklTo'), o.address, false));
    box.appendChild(row(t('orderNo'), o.id, true));
    if (o.status === 'sent' && /^[0-9a-f]{64}$/.test(o.txid || '')) {
      var a = el('a', 'btn small', t('viewTx')); a.href = EXPLORER_TX + o.txid; a.target = '_blank'; a.rel = 'noopener noreferrer';
      box.appendChild(a);
    }
    var actions = el('div', 'order-actions');
    if (o.status !== 'sent') {
      var c = el('button', 'btn small', t('checkNow')); c.type = 'button';
      c.addEventListener('click', function () { c.disabled = true; c.textContent = t('checking'); refresh().then(function () { c.disabled = false; }); });
      actions.appendChild(c);
    }
    var n = el('button', 'btn small', t('newOrder')); n.type = 'button';
    n.addEventListener('click', function () { if (current && current.status === 'sent') forget(current.id); current = null; stopTimers(); render(); });
    actions.appendChild(n);
    box.appendChild(actions);
    if (lastCheck && o.status !== 'sent') box.appendChild(el('p', 'tiny muted', t('checkedAt', { time: lastCheck.toLocaleTimeString() })));
  }
  function countdown(until) {
    var s = Math.max(0, Math.round((until - Date.now()) / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function stopTimers() { clearTimeout(pollTimer); clearInterval(tickTimer); pollTimer = tickTimer = null; }
  function show(o) {
    current = o; lastCheck = new Date();
    stopTimers(); render();
    if (o.status === 'sent') return;
    tickTimer = setInterval(function () {
      var left = document.getElementById('buyLeft');
      if (current && current.status === 'open') {
        if (Date.now() >= current.expires) { current.status = 'expired'; render(); }
        else if (left) left.querySelector('code').textContent = countdown(current.expires);
      }
    }, 1000);
    schedule();
  }
  function schedule() { // every 15 s while the page is open and visible, for up to a day
    clearTimeout(pollTimer);
    if (!current || current.status === 'sent' || Date.now() - current.created > 86400000) return;
    pollTimer = setTimeout(function () { if (document.hidden) schedule(); else refresh().then(schedule); }, 15000);
  }
  function refresh() {
    if (!current) return Promise.resolve();
    var id = current.id;
    return api('GET', '/order?id=' + encodeURIComponent(id)).then(function (r) {
      if (!current || current.id !== id) return;
      if (r.ok && r.body.id === id) { var was = current.status; current = r.body; lastCheck = new Date(); if (current.status === 'sent' && was !== 'sent') stopTimers(); render(); if (current.status !== 'sent' && !tickTimer) show(current); }
      else if (r.body.error === 'NOT_FOUND') { forget(id); current = null; stopTimers(); render(); showMsg(errorText('NOT_FOUND'), true); }
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && current && current.status !== 'sent') refresh(); });

  // the language switch re-renders what this script wrote
  new MutationObserver(function () { updateCost(); if (current) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // is the sale reachable? then pick up this browser's last unfinished order
  api('GET', '').then(function (r) {
    if (!r.ok || !r.body.payTo) { form.hidden = true; off.hidden = false; return; }
    info = r.body;
    var ids = [];
    try { ids = JSON.parse(localStorage.getItem(KEEP) || '[]'); } catch (e) {}
    if (!ids.length || !/^[a-z2-9]{12}$/.test(ids[0])) return;
    api('GET', '/order?id=' + encodeURIComponent(ids[0])).then(function (o) {
      if (o.ok && o.body.id === ids[0] && o.body.status !== 'sent') show(o.body);
      else if (o.body.error === 'NOT_FOUND') forget(ids[0]);
    });
  });
})();
