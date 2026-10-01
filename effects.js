// Tokel Genesis visual effects and live chain data. All hand-written: no libraries, nothing loaded from elsewhere.
// Everything stops when the tab is hidden and is skipped entirely for "reduce motion".
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var dark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- 1. starfield: depth layers, pointer parallax, twinkle, shooting stars ---------- */
  var canvas = document.getElementById('starfield');
  var cosmos = canvas && canvas.parentNode;
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var stars = [], shooting = [], W = 0, H = 0, dpr = 1;
    var px = 0, py = 0, tx = 0, ty = 0, running = true, last = 0, nextShot = 1500;
    var seed = 7;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function resize() {
      var r = cosmos.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(260, W * H / 5200));
      stars = [];
      seed = 7;
      for (var i = 0; i < count; i++) {
        var depth = rand();
        stars.push({ x: rand() * W, y: rand() * H, z: depth, r: 0.4 + depth * 1.5, tw: rand() * Math.PI * 2, sp: 0.6 + rand() * 1.6 });
      }
    }

    function shoot() {
      var fromLeft = rand() < 0.5;
      shooting.push({ x: fromLeft ? rand() * W * 0.5 : W * 0.5 + rand() * W * 0.5, y: rand() * H * 0.45, vx: (fromLeft ? 1 : -1) * (6 + rand() * 5), vy: 2.2 + rand() * 2, life: 1 });
    }

    function frame(t) {
      if (!running) return;
      var dt = Math.min(50, t - (last || t)); last = t;
      px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      ctx.clearRect(0, 0, W, H);
      var isDark = dark.matches;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.tw += dt * 0.001 * s.sp;
        var a = (isDark ? 0.45 : 0.18) + Math.sin(s.tw) * (isDark ? 0.35 : 0.12);
        var x = s.x + px * s.z * 26, y = s.y + py * s.z * 18;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = isDark ? '#ffffff' : '#7a6fd0';
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      }
      nextShot -= dt;
      if (nextShot <= 0) { shoot(); nextShot = 2600 + rand() * 4200; }
      for (var j = shooting.length - 1; j >= 0; j--) {
        var m = shooting[j];
        m.x += m.vx * dt / 16; m.y += m.vy * dt / 16; m.life -= dt / 1100;
        if (m.life <= 0 || m.x < -200 || m.x > W + 200) { shooting.splice(j, 1); continue; }
        var g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
        g.addColorStop(0, isDark ? 'rgba(255,240,220,' + m.life + ')' : 'rgba(255,140,60,' + m.life * 0.8 + ')');
        g.addColorStop(1, 'rgba(255,150,60,0)');
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize();
    cosmos.classList.add('live-stars');
    window.addEventListener('resize', resize);
    if (reduce) {
      frame(0); running = false; // one still frame
    } else {
      window.addEventListener('pointermove', function (e) { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        running = !document.hidden;
        if (running) { last = 0; requestAnimationFrame(frame); }
      });
      requestAnimationFrame(frame);
    }
  }

  if (reduce) { liveData(); return; }

  /* ---------- 2. title entrance: letters rise in one by one ---------- */
  var title = document.querySelector('.reveal-title');
  if (title) {
    var n = 0;
    Array.prototype.forEach.call(title.querySelectorAll('[data-i18n]'), function (part) {
      var text = part.textContent;
      part.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = text[i] === ' ' ? '\u00a0' : text[i]; // a plain space would collapse inside inline-block
        ch.style.animationDelay = (0.08 + n++ * 0.07) + 's';
        part.appendChild(ch);
      }
    });
    title.classList.add('go');
  }

  /* ---------- 3. sections rise in as they scroll into view ---------- */
  var items = document.querySelectorAll('.section .head, .section .card, .section .glass, .live');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(items, function (el, i) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('rise');
        el.style.transitionDelay = ((i % 3) * 0.07) + 's';
        io.observe(el);
      }
    });
  }

  /* ---------- 4. planet drifts with scrolling (parallax) ---------- */
  var planetSvg = cosmos && cosmos.querySelector('svg');
  if (planetSvg) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        planetSvg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 5. cards tilt toward the pointer with a moving sheen (mouse/trackpad only) ---------- */
  if (finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
      card.classList.add('tilt');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 7) + 'deg) rotateY(' + ((x - 0.5) * 9) + 'deg) translateY(-3px)';
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  liveData();

  /* ---------- 6. live chain data from the public explorer ---------- */
  function liveData() {
    var API = 'https://explorer.tokel.io/insight-api-komodo/';
    var hEl = document.getElementById('liveHeight');
    if (!hEl) return;
    var ageEl = document.getElementById('liveAge'), diffEl = document.getElementById('liveDiff'), peersEl = document.getElementById('livePeers');
    var pulse = document.getElementById('livePulse');
    var shown = 0, lastTime = 0;
    function getJSON(path) {
      return fetch(API + path, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
    }
    function countTo(target) {
      if (reduce || !shown) { shown = target; hEl.textContent = target.toLocaleString('en-US'); return; }
      var from = shown, start = performance.now();
      (function step(t) {
        var k = Math.min(1, (t - start) / 900);
        var v = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
        hEl.textContent = v.toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(step); else shown = target;
      })(start);
    }
    function ageText(sec) {
      var en = document.documentElement.lang === 'en';
      if (sec < 90) return en ? sec + ' s' : sec + ' 秒';
      var m = Math.round(sec / 60);
      if (m < 90) return en ? m + ' min' : m + ' 分鐘';
      var h = Math.round(sec / 360) / 10;
      return en ? h + ' h' : h + ' 小時';
    }
    function tickAge() {
      if (!lastTime) return;
      var sec = Math.max(0, Math.round(Date.now() / 1000 - lastTime));
      ageEl.textContent = ageText(sec);
      pulse.className = 'pulse ' + (sec < 600 ? 'ok' : sec < 3600 ? 'slow' : 'idle');
    }
    function refresh() {
      if (document.hidden) return;
      getJSON('status').then(function (st) {
        var info = st.info || {};
        if (typeof info.blocks !== 'number') throw new Error('bad status');
        countTo(info.blocks);
        diffEl.textContent = (Math.round(info.difficulty * 100) / 100).toLocaleString('en-US');
        peersEl.textContent = info.connections;
        return getJSON('block-index/' + info.blocks).then(function (bi) { return getJSON('block/' + bi.blockHash); });
      }).then(function (b) {
        if (b && typeof b.time === 'number') { lastTime = b.time; tickAge(); }
      }).catch(function () {
        pulse.className = 'pulse idle';
        if (!shown) { hEl.textContent = '—'; }
      });
    }
    refresh();
    setInterval(refresh, 60000);
    setInterval(tickAge, 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  }
})();
