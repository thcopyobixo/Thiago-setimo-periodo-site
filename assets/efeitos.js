/* =========================================================
   Sétimo Período · efeitos e interatividade
   Não altera conteúdo nem funções: só acrescenta movimento.
   Carregado no fim de cada página, depois dos scripts dela.
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var body = document.body;
  var EASE = 'cubic-bezier(.23, 1, .32, 1)';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function has(name) { try { return typeof window.eval(name) !== 'undefined'; } catch (e) { return false; } }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- 1. Entrada da página ---------- */
  body.classList.add('fx-intro');
  setTimeout(function () { body.classList.remove('fx-intro'); }, 1400);

  /* ---------- 2. Fundo vivo + luz que segue o mouse ---------- */
  var aurora = document.createElement('div');
  aurora.className = 'fx-aurora';
  aurora.innerHTML = '<span></span><span></span><span></span>';
  body.insertBefore(aurora, body.firstChild);

  if (finePointer && !reduce) {
    var spot = document.createElement('div');
    spot.className = 'fx-spot';
    body.insertBefore(spot, aurora.nextSibling);
    var sx = innerWidth / 2, sy = innerHeight / 2, tx = sx, ty = sy, spotRaf = 0;
    function spotLoop() {
      sx = lerp(sx, tx, .14); sy = lerp(sy, ty, .14);
      spot.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
      spotRaf = (Math.abs(sx - tx) + Math.abs(sy - ty) > .5) ? requestAnimationFrame(spotLoop) : 0;
    }
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!body.classList.contains('fx-pointer')) body.classList.add('fx-pointer');
      if (!spotRaf) spotRaf = requestAnimationFrame(spotLoop);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { body.classList.remove('fx-pointer'); });
  }

  /* ---------- 3. Onda de clique ---------- */
  var RIPPLE = '.btn, .nav-item, .tab, .key, .alt, .nav-btn, .btn-confirm, .ac-btn, a.card, .q-cell, .page-nav button, .top-btn, .gabarito-toggle, .ecg-nav-item, .back-link';
  document.addEventListener('pointerdown', function (e) {
    if (reduce || e.button !== 0) return;
    var el = e.target.closest(RIPPLE);
    if (!el || el.disabled || el.classList.contains('disabled')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var host = el.querySelector(':scope > .fx-ripple-host');
    if (!host) { host = document.createElement('span'); host.className = 'fx-ripple-host'; el.insertBefore(host, el.firstChild); }
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2.2;
    var dot = document.createElement('span');
    dot.className = 'fx-ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = (e.clientX - r.left - size / 2) + 'px';
    dot.style.top = (e.clientY - r.top - size / 2) + 'px';
    host.appendChild(dot);
    dot.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }],
      { duration: 650, easing: EASE }).onfinish = function () { dot.remove(); };
  }, { passive: true });

  /* ---------- 4. Destaque deslizante no menu lateral ---------- */
  function slidingPill(container) {
    if (!container) return;
    container.classList.add('fx-has-pill');
    var pill = document.createElement('span');
    pill.className = 'fx-pill fx-instant';
    container.insertBefore(pill, container.firstChild);
    var placed = false, queued = false;
    function update() {
      queued = false;
      if (!container.contains(pill)) container.insertBefore(pill, container.firstChild);
      var active = container.querySelector('.active');
      if (!active || active.offsetParent === null) { pill.style.opacity = '0'; return; }
      pill.style.opacity = '1';
      pill.style.width = active.offsetWidth + 'px';
      pill.style.height = active.offsetHeight + 'px';
      pill.style.transform = 'translate(' + active.offsetLeft + 'px,' + active.offsetTop + 'px)';
      if (!placed) { placed = true; pill.offsetWidth; pill.classList.remove('fx-instant'); }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    new MutationObserver(queue).observe(container, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    new MutationObserver(queue).observe(body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', queue);
    document.addEventListener('transitionend', function (e) { if (e.target.matches && e.target.matches('aside.sidebar, main')) queue(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    update();
  }
  ['#navList', '#tabs', '#conf-tabs', '.ecg-nav'].forEach(function (s) { slidingPill($(s)); });

  /* ---------- 5. Inclinação 3D que segue o mouse ---------- */
  function tilt(el, max, lift) {
    if (!finePointer || reduce) return;
    var rx = 0, ry = 0, trx = 0, try_ = 0, raf = 0, inside = false;
    function loop() {
      rx = lerp(rx, trx, .18); ry = lerp(ry, try_, .18);
      el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(' + lift + 'px)';
      if (inside || Math.abs(rx - trx) + Math.abs(ry - try_) > .05) raf = requestAnimationFrame(loop);
      else raf = 0;
    }
    el.addEventListener('pointermove', function (e) {
      if (el.classList.contains('disabled') || el.classList.contains('blinking')) return;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (px * 100) + '%');
      el.style.setProperty('--my', (py * 100) + '%');
      trx = (.5 - py) * max * 2; try_ = (px - .5) * max * 2;
      inside = true;
      el.classList.add('fx-tilting');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    el.addEventListener('pointerleave', function () {
      inside = false;
      cancelAnimationFrame(raf); raf = 0;
      el.classList.remove('fx-tilting');
      el.style.transform = '';
    });
  }

  /* ---------- 6. Faíscas e confete ---------- */
  function sparks(x, y, colors, count) {
    if (reduce) return;
    count = count || 14;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'fx-spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      var c = colors[i % colors.length];
      s.style.background = c;
      s.style.boxShadow = '0 0 10px ' + c;
      body.appendChild(s);
      var a = (Math.PI * 2 * i) / count + Math.random() * .5;
      var d = 40 + Math.random() * 60;
      s.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d) + 'px,' + (Math.sin(a) * d - 20) + 'px) scale(0)', opacity: 0 }
      ], { duration: 600 + Math.random() * 300, easing: EASE }).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }
  function centerOf(el) {
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function confetti(strength) {
    if (reduce) return;
    var cv = document.createElement('canvas');
    cv.className = 'fx-confetti';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    body.appendChild(cv);
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    var colors = ['#60a5fa', '#3b82f6', '#1d4ed8', '#f8fafc', '#10b981', '#93c5fd', '#f59e0b'];
    var parts = [];
    var n = strength || 140;
    for (var i = 0; i < n; i++) {
      var fromLeft = i % 2 === 0;
      parts.push({
        x: fromLeft ? -10 : innerWidth + 10,
        y: innerHeight * (.55 + Math.random() * .25),
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9),
        vy: -(9 + Math.random() * 11),
        w: 6 + Math.random() * 6, h: 3 + Math.random() * 4,
        r: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
        c: colors[i % colors.length]
      });
    }
    var start = performance.now();
    (function frame(t) {
      var el = (t - start) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(function (p) {
        p.vy += .38; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - 1.6) / .8);
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
        ctx.restore();
      });
      if (el < 2.5) requestAnimationFrame(frame); else cv.remove();
    })(start);
  }

  var toastEl = null, toastTimer = 0;
  function toast(num, text, gold) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'fx-toast'; toastEl.setAttribute('role', 'status'); body.appendChild(toastEl); }
    toastEl.innerHTML = '<b>' + num + '</b><span>' + text + '</span>';
    toastEl.classList.toggle('gold', !!gold);
    toastEl.classList.remove('show'); toastEl.offsetWidth; toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1700);
  }

  function countUp(el) {
    if (reduce || el.dataset.fxCounted) return;
    el.dataset.fxCounted = '1';
    var original = el.textContent;
    var nums = original.match(/\d+/g);
    if (!nums) return;
    var t0 = performance.now(), dur = 900;
    (function frame(t) {
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      var i = 0;
      el.textContent = original.replace(/\d+/g, function (m) { i++; return String(Math.round(+m * e)); });
      if (k < 1) requestAnimationFrame(frame); else el.textContent = original;
    })(t0);
  }

  function wrap(name, after, before) {
    var orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      var ctx = before ? before.apply(this, arguments) : undefined;
      var out = orig.apply(this, arguments);
      if (after) after.apply(this, [ctx].concat(Array.prototype.slice.call(arguments)));
      return out;
    };
  }

  /* ---------- 7. Página inicial ---------- */
  var landing = $('#landing');
  if (landing) {
    // Linha de monitor cardíaco atrás do título
    if (!reduce) {
      var cv = document.createElement('canvas');
      cv.className = 'fx-ecg';
      var inner = $('.landing-inner') || landing;
      inner.insertBefore(cv, inner.firstChild);
      var ctx = cv.getContext('2d');
      var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
      function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size(); window.addEventListener('resize', size);
      function beat(p) { // p = posição dentro do batimento (0..1) -> deslocamento vertical
        if (p < .10) return -Math.sin(p / .10 * Math.PI) * 8;               // P
        if (p < .16) return 0;
        if (p < .18) return (p - .16) / .02 * 10;                            // Q
        if (p < .21) return 10 - (p - .18) / .03 * 90;                       // R
        if (p < .24) return -80 + (p - .21) / .03 * 100;                     // S
        if (p < .26) return 20 - (p - .24) / .02 * 20;
        if (p < .42) return 0;
        if (p < .58) return -Math.sin((p - .42) / .16 * Math.PI) * 18;       // T
        return 0;
      }
      var period = 240, speed = 180, last = performance.now(), head = 0, pts = [];
      function draw(t) {
        if (body.classList.contains('detail-view') || document.hidden) { last = t; requestAnimationFrame(draw); return; }
        var dt = Math.min(.05, (t - last) / 1000); last = t;
        head += speed * dt;
        var x = head % (W + 80);
        if (x < speed * dt + 1) pts = [];
        var y = H / 2 + beat(((head % period) / period)) * (H / 260);
        pts.push({ x: x, y: y });
        while (pts.length && pts[0].x < x - W * .55) pts.shift();
        ctx.clearRect(0, 0, W, H);
        ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        for (var i = 1; i < pts.length; i++) {
          var a = i / pts.length;
          ctx.strokeStyle = 'rgba(96,165,250,' + (a * .55).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        }
        if (pts.length) {
          var p = pts[pts.length - 1];
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
          g.addColorStop(0, 'rgba(191,219,254,.95)'); g.addColorStop(1, 'rgba(59,130,246,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, 6.29); ctx.fill();
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    }

    $$('.ac-btn').forEach(function (b) { tilt(b, 9, -6); });

    wrap('openAC', null, function () {
      var ev = window.event;
      var btn = ev && ev.currentTarget && ev.currentTarget.classList ? ev.currentTarget : null;
      if (btn) {
        btn.classList.remove('fx-tilting'); btn.style.transform = '';
        btn.classList.add('fx-chosen');
        setTimeout(function () { btn.classList.remove('fx-chosen'); }, 700);
      }
    });

    // Cards das áreas: 3D, ícone que se desenha e números que contam
    $$('a.card').forEach(function (c) { tilt(c, 5, -4); });
    $$('.icon-wrap svg').forEach(function (svg) {
      $$('path, line, rect, circle, polyline', svg).forEach(function (p) {
        p.setAttribute('pathLength', '1');
        p.setAttribute('data-fx-draw', '');
        p.style.strokeDasharray = '1';
      });
    });
    function countVisible() {
      $$('.ac-section:not([hidden]) .meta, .ac-section:not([hidden]) .chip').forEach(function (m) {
        m.dataset.fxCounted = ''; countUp(m);
      });
    }
    wrap('selectSection', function () { setTimeout(countVisible, 250); });
    if (body.classList.contains('detail-view')) countVisible();
  }

  /* ---------- 8. Flashcards ---------- */
  if (has('DECKS') && $('#main')) {
    var streak = 0;
    var mainEl = $('#main');

    // Inclinação do card acompanhando o mouse
    if (finePointer && !reduce) {
      var cur = null, crx = 0, cry = 0, ctrx = 0, ctry = 0, craf = 0;
      function cardLoop() {
        if (!cur || !document.body.contains(cur)) { craf = 0; return; }
        crx = lerp(crx, ctrx, .15); cry = lerp(cry, ctry, .15);
        if (!cur.classList.contains('blinking')) cur.style.transform = 'rotateX(' + crx.toFixed(2) + 'deg) rotateY(' + cry.toFixed(2) + 'deg) translateY(-3px)';
        craf = requestAnimationFrame(cardLoop);
      }
      mainEl.addEventListener('pointermove', function (e) {
        var card = e.target.closest('.card');
        if (card !== cur && cur) { cur.style.transform = ''; cur.classList.remove('fx-tilting'); }
        cur = card;
        if (!card) { cancelAnimationFrame(craf); craf = 0; return; }
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        $$('.face', card).forEach(function (f) { f.style.setProperty('--mx', px * 100 + '%'); f.style.setProperty('--my', py * 100 + '%'); });
        ctrx = (.5 - py) * 6; ctry = (px - .5) * 8;
        card.classList.add('fx-tilting');
        if (!craf) craf = requestAnimationFrame(cardLoop);
      });
      mainEl.addEventListener('pointerleave', function () {
        if (cur) { cur.style.transform = ''; cur.classList.remove('fx-tilting'); }
        cur = null; cancelAnimationFrame(craf); craf = 0;
      });
    }

    wrap('mark', function (ctx, kind) {
      if (!ctx) return;
      if (kind === 'ok') {
        streak++;
        var c = centerOf($('.key.ok'));
        sparks(c.x, c.y, ['#10b981', '#34d399', '#a7f3d0', '#60a5fa'], 16);
        if (streak === 3 || streak === 5 || (streak >= 10 && streak % 5 === 0)) {
          toast(streak, streak >= 10 ? 'acertos seguidos! Você está voando.' : 'acertos seguidos!', streak >= 10);
          if (streak >= 10) confetti(90);
        }
      } else {
        streak = 0;
        var k = $('.key.err');
        if (k) { k.classList.remove('fx-shake'); k.offsetWidth; k.classList.add('fx-shake'); }
      }
    }, function () {
      return !(window.state && false) && !stateBusy();
    });
    function stateBusy() { try { return window.eval('state.finished || state.animating'); } catch (e) { return false; } }

    wrap('renderEnd', function () {
      var pctEl = $('.end-screen .pct');
      var pct = pctEl ? parseInt(pctEl.textContent, 10) : 0;
      if (pct >= 75) setTimeout(function () { confetti(pct >= 90 ? 180 : 110); }, 700);
      streak = 0;
    });
    wrap('shuffle', function () {
      var cc = $('.card-container');
      if (cc && !reduce) { cc.classList.remove('fx-shuffle'); cc.offsetWidth; cc.classList.add('fx-shuffle'); }
      streak = 0;
    });
    wrap('selectDeck', function () { streak = 0; });
  }

  /* ---------- 9. Simulados ---------- */
  if (has('QUESTIONS') && $('#qGrid')) {
    var quiz = $('#quiz');
    var lastIndex = null;
    function stateGet(expr) { try { return window.eval(expr); } catch (e) { return undefined; } }
    wrap('render', function () {
      var idx = stateGet('state.index');
      var finished = stateGet('state.finished');
      var card = $('.question-card');
      if (card && !finished && idx !== lastIndex) card.classList.add('fx-q-enter');
      lastIndex = finished ? null : idx;
    });
    lastIndex = stateGet('state.index');
    var firstCard = $('.question-card');
    if (firstCard) firstCard.classList.add('fx-q-enter');

    wrap('confirmAnswer', function (had, n) {
      var ans = stateGet('state.answers[' + JSON.stringify(n) + ']');
      if (had || !ans) return;
      quiz.classList.add('fx-just');
      setTimeout(function () { quiz.classList.remove('fx-just'); }, 1000);
      var q = stateGet('QUESTIONS.find(function (x) { return x.n === ' + JSON.stringify(n) + '; })');
      if (q && ans === q.correta) {
        var c = centerOf($('.alt.correct-alt .alt-key'));
        sparks(c.x, c.y, ['#10b981', '#34d399', '#a7f3d0', '#60a5fa'], 18);
      }
    }, function (n) { return !!stateGet('state.answers[' + JSON.stringify(n) + ']'); });

    wrap('renderEnd', function () {
      var pctEl = $('.end-screen .pct');
      var pct = pctEl ? parseInt(pctEl.textContent, 10) : 0;
      if (pct >= 75) setTimeout(function () { confetti(pct >= 90 ? 180 : 110); }, 700);
    });
  }

  /* ---------- 10. Aparecer ao rolar + barra de leitura (materiais e ECG) ---------- */
  var reading = $('.pdf-viewer') || $('.ecg-content');
  if (reading) {
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    body.appendChild(bar);
    var barQueued = false;
    function barUpdate() {
      barQueued = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    }
    window.addEventListener('scroll', function () { if (!barQueued) { barQueued = true; requestAnimationFrame(barUpdate); } }, { passive: true });
    barUpdate();

    if (!reduce && 'IntersectionObserver' in window) {
      body.classList.add('fx-reveal');
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('fx-in'); revealIO.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
      $$('.pdf-page, .ecg-content .concept-box, .ecg-content .ecg-section, .ecg-content .summary-table-wrap, .ecg-content .clinical-note')
        .forEach(function (el) { revealIO.observe(el); });
    }
  }

  /* ---------- 11. Traçados de ECG que se desenham ---------- */
  if ($('.ecg-strip') && !reduce && 'IntersectionObserver' in window) {
    var drawIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        drawIO.unobserve(en.target);
        $$('path.fx-trace', en.target).forEach(function (p, i) {
          p.style.transition = 'stroke-dashoffset 1700ms cubic-bezier(.65, 0, .35, 1) ' + (i * 120) + 'ms';
          p.style.strokeDashoffset = '0';
        });
      });
    }, { threshold: .35 });
    $$('.ecg-strip svg').forEach(function (svg) {
      var any = false;
      $$('path', svg).forEach(function (p) {
        if (p.closest('defs, pattern')) return;
        var len = 0;
        try { len = p.getTotalLength(); } catch (e) { return; }
        if (len < 300) return;
        p.classList.add('fx-trace');
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        any = true;
      });
      if (any) drawIO.observe(svg);
    });
  }

  /* ---------- 12. Páginas dos materiais em tela cheia ---------- */
  if ($('.pdf-viewer')) {
    var ICON = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
    var lb = null, figs = [], idx = 0;
    function show(i, fromEl) {
      idx = Math.max(0, Math.min(figs.length - 1, i));
      var fig = figs[idx];
      var img = lb.querySelector('img');
      img.src = fig.querySelector('img').currentSrc || fig.querySelector('img').src;
      img.alt = fig.querySelector('img').alt || '';
      var cap = fig.querySelector('figcaption');
      lb.querySelector('.fx-lb-count').textContent = cap ? cap.textContent : ('Página ' + (idx + 1));
      lb.querySelector('[data-a="prev"]').disabled = idx === 0;
      lb.querySelector('[data-a="next"]').disabled = idx === figs.length - 1;
      lb.classList.remove('zoomed');
      lb.querySelector('.fx-lb-scroll').scrollTo(0, 0);
      if (fromEl && !reduce) {
        var a = fromEl.getBoundingClientRect();
        requestAnimationFrame(function () {
          var b = img.getBoundingClientRect();
          if (!b.width) return;
          img.animate([
            { transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ')' },
            { transform: 'none' }
          ], { duration: 420, easing: EASE });
        });
      }
    }
    function open(fig) {
      var section = fig.closest('.tutoria') || document;
      figs = $$('.pdf-page', section);
      lb = document.createElement('div');
      lb.className = 'fx-lb';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Página ampliada');
      lb.innerHTML =
        '<div class="fx-lb-scroll"><img alt=""></div>' +
        '<div class="fx-lb-bar">' +
          '<button data-a="prev" title="Página anterior (←)" aria-label="Página anterior">' + ICON('<path d="M15 6l-6 6l6 6"/>') + '</button>' +
          '<span class="fx-lb-count"></span>' +
          '<button data-a="next" title="Próxima página (→)" aria-label="Próxima página">' + ICON('<path d="M9 6l6 6l-6 6"/>') + '</button>' +
          '<button data-a="zoom" title="Aumentar ou diminuir" aria-label="Aumentar ou diminuir">' + ICON('<circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/><path d="M7 10h6"/><path d="M10 7v6"/>') + '</button>' +
          '<button data-a="close" title="Fechar (Esc)" aria-label="Fechar">' + ICON('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>') + '</button>' +
        '</div>';
      body.appendChild(lb);
      body.style.overflow = 'hidden';
      requestAnimationFrame(function () { lb.classList.add('open'); });
      show(figs.indexOf(fig), fig.querySelector('img'));
      lb.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (b) {
          var a = b.dataset.a;
          if (a === 'prev') show(idx - 1);
          if (a === 'next') show(idx + 1);
          if (a === 'zoom') lb.classList.toggle('zoomed');
          if (a === 'close') close();
          return;
        }
        if (e.target.tagName === 'IMG') lb.classList.toggle('zoomed');
        else if (e.target.classList.contains('fx-lb-scroll')) close();
      });
      lb.querySelector('[data-a="close"]').focus();
    }
    function close() {
      if (!lb) return;
      var el = lb; lb = null;
      el.classList.remove('open');
      body.style.overflow = '';
      var target = figs[idx];
      if (target) target.scrollIntoView({ block: 'center' });
      setTimeout(function () { el.remove(); }, 260);
    }
    document.addEventListener('click', function (e) {
      var fig = e.target.closest('.pdf-page');
      if (fig && !lb) open(fig);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else return;
      e.preventDefault(); e.stopPropagation();
    }, true);
  }
})();
