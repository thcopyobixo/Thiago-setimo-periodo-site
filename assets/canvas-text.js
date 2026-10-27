/* =========================================================
   Título em partículas (tela inicial)
   Adaptado de "CanvasText" — Wensity Labs (MIT), 21st.dev:
   as letras viram partículas que giram num anel de carregamento,
   depois se encaixam no texto; o mouse afasta as partículas.
   Uso: <h1 class="ct-title" data-lines="Thiago|7º Período"><canvas></canvas></h1>
   ========================================================= */
(function () {
  var TWO_PI = Math.PI * 2;
  var SPIN_RATE = 0.0024;
  var MAX_PARTICLES = 7000;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function CanvasText(host, opts) {
    this.host = host;
    this.canvas = host.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.lines = (host.dataset.lines || host.textContent).split('|');
    this.o = Object.assign({
      fontFamily: "'Unbounded', 'Segoe UI', sans-serif",
      fontWeight: 800,
      density: 2,          // passo da amostragem (px)
      particleSize: 2,
      scatter: 90,         // raio do anel de carregamento
      loadMs: 1000,        // tempo girando no anel
      morphMs: 1500,       // anel -> texto
      magnetic: 0.45,
      magneticRadius: 110,
      colors: ['#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8']
    }, opts || {});
    this.pointer = { x: 0, y: 0, active: false };
    this.running = false;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var self = this;
    this.tick = function (now) { self._tick(now); };
    this.build();
    var t;
    new ResizeObserver(function () {
      if (host.clientWidth === self.W) return;   // só reconstrói se a largura mudar
      clearTimeout(t); t = setTimeout(function () { self.build(true); }, 120);
    }).observe(host);
    host.addEventListener('pointermove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.pointer.x = e.clientX - r.left; self.pointer.y = e.clientY - r.top; self.pointer.active = true;
      self.kick();
    }, { passive: true });
    host.addEventListener('pointerleave', function () { self.pointer.active = false; self.kick(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.kick(); });
  }

  CanvasText.prototype.build = function (keepSettled) {
    var host = this.host, o = this.o;
    var W = Math.max(1, host.clientWidth);
    // tamanho da fonte: a maior linha ocupa até 92% da largura
    var probe = document.createElement('canvas').getContext('2d');
    probe.font = o.fontWeight + ' 100px ' + o.fontFamily;
    var widest = Math.max.apply(null, this.lines.map(function (l) { return probe.measureText(l).width; }));
    var fs = Math.min(150, window.innerHeight * 0.115, Math.max(34, (W * 0.92) / widest * 100));
    var lineH = fs * 1.08;
    var H = Math.ceil(lineH * this.lines.length + fs * 0.35);
    host.style.height = H + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W; this.H = H; this.dpr = dpr; this.fs = fs;
    this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr);
    this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // rasteriza o texto fora da tela e amostra os pixels
    var off = document.createElement('canvas');
    off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
    var octx = off.getContext('2d', { willReadFrequently: true });
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.fillStyle = '#fff';
    octx.font = o.fontWeight + ' ' + fs + 'px ' + o.fontFamily;
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    var top = (H - lineH * this.lines.length) / 2 + lineH / 2;
    var self = this;
    this.lines.forEach(function (l, i) { octx.fillText(l, W / 2, top + i * lineH); });
    var data = octx.getImageData(0, 0, off.width, off.height).data;
    var step = Math.max(1, Math.round(o.density * dpr));
    var filled = 0;
    for (var y = 0; y < off.height; y += step) for (var x = 0; x < off.width; x += step) if (data[(y * off.width + x) * 4 + 3] > 127) filled++;
    if (filled > MAX_PARTICLES) step = Math.ceil(step * Math.sqrt(filled / MAX_PARTICLES));
    this.particleSize = Math.max(1.4, Math.min(3, step / dpr * 0.95));

    var ps = [];
    for (y = 0; y < off.height; y += step) {
      for (x = 0; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] < 128) continue;
        ps.push({ hx: x / dpr, hy: y / dpr, x: 0, y: 0, ox: 0, oy: 0, vx: 0, vy: 0, seed: 0, ang: 0, rad: 0 });
      }
    }
    // anel de carregamento no centro
    var cx = W / 2, cy = H / 2;
    var ring = Math.min(o.scatter, Math.min(W, H) / 2 - 12);
    ps.forEach(function (p, i) {
      var s = Math.random();
      p.ang = i * (TWO_PI / ps.length) + s * 0.08;
      p.rad = ring * (0.88 + s * 0.24);
      p.seed = s * 1000;
      if (keepSettled || self.reduced) { p.x = p.hx; p.y = p.hy; }
      else { p.x = cx + Math.cos(p.ang) * p.rad; p.y = cy + Math.sin(p.ang) * p.rad; }
    });
    this.ps = ps; this.cx = cx; this.cy = cy;
    // gradiente azul do site, de cima para baixo
    var g = this.ctx.createLinearGradient(0, 0, W, H);
    o.colors.forEach(function (c, i) { g.addColorStop(i / (o.colors.length - 1), c); });
    this.fill = g;
    this.elapsed = keepSettled || this.reduced ? o.loadMs + o.morphMs : 0;
    this.morphReady = false;
    this.last = performance.now();
    this.paint();
    this.kick();
  };

  CanvasText.prototype.kick = function () {
    if (this.running || this.reduced || document.hidden) return;
    this.running = true; this.last = performance.now();
    requestAnimationFrame(this.tick);
  };

  CanvasText.prototype._tick = function (now) {
    var busy = this.step(now);
    this.paint();
    if (busy) requestAnimationFrame(this.tick); else this.running = false;
  };

  CanvasText.prototype.step = function (now) {
    var o = this.o, ps = this.ps, i, p;
    this.elapsed += Math.max(0, Math.min(64, now - this.last));
    this.last = now;
    var t = this.elapsed;
    if (t < o.loadMs) {                       // fase 1: anel girando
      var spin = t * SPIN_RATE;
      for (i = 0; i < ps.length; i++) { p = ps[i]; p.x = this.cx + Math.cos(p.ang + spin) * p.rad; p.y = this.cy + Math.sin(p.ang + spin) * p.rad; }
      return true;
    }
    var m = t - o.loadMs;
    if (m < o.morphMs) {                      // fase 2: anel -> texto
      if (!this.morphReady) { for (i = 0; i < ps.length; i++) { ps[i].ox = ps[i].x; ps[i].oy = ps[i].y; } this.morphReady = true; }
      var raw = m / o.morphMs;
      for (i = 0; i < ps.length; i++) {
        p = ps[i];
        var st = (p.seed % 180) / 1000;
        var u = easeOutCubic(Math.min(1, Math.max(0, (raw - st * 0.12) / (1 - st * 0.12))));
        p.x = p.ox + (p.hx - p.ox) * u; p.y = p.oy + (p.hy - p.oy) * u;
      }
      return true;
    }
    // fase 3: assentado; o mouse empurra as partículas
    var pt = this.pointer, live = pt.active && o.magnetic > 0, r2 = o.magneticRadius * o.magneticRadius, moving = false;
    for (i = 0; i < ps.length; i++) {
      p = ps[i];
      var tx = p.hx, ty = p.hy;
      if (live) {
        var dx = p.hx - pt.x, dy = p.hy - pt.y, d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0) {
          var d = Math.sqrt(d2), f = 1 - d / o.magneticRadius, push = o.magnetic * f * f * 28;
          tx += dx / d * push; ty += dy / d * push;
        }
      }
      p.vx = (p.vx + (tx - p.x) * 0.22) * 0.76;
      p.vy = (p.vy + (ty - p.y) * 0.22) * 0.76;
      p.x += p.vx; p.y += p.vy;
      if (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || Math.abs(tx - p.x) > 0.05) moving = true;
    }
    return live || moving;
  };

  CanvasText.prototype.paint = function () {
    var ctx = this.ctx, ps = this.ps, s = this.particleSize, h = s / 2;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = this.fill;
    ctx.beginPath();
    for (var i = 0; i < ps.length; i++) ctx.rect(ps[i].x - h, ps[i].y - h, s, s);
    ctx.fill();
  };

  function start() {
    document.querySelectorAll('.ct-title').forEach(function (el) {
      if (el._ct) return;
      el._ct = new CanvasText(el);
    });
  }
  // espera a fonte Unbounded carregar para rasterizar as letras certas
  var ready = document.fonts && document.fonts.load ? document.fonts.load("800 100px 'Unbounded'").catch(function () {}) : Promise.resolve();
  ready.then(function () { (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', start) : start(); });
  window.CanvasText = CanvasText;
})();
