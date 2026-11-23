/* Júlia Gonzaga · Body Piercer · link da bio
   Sem dependências. Abertura, rosetas no canvas, parallax, fotos de clientes e microinterações. */
(() => {
  'use strict';

  const WA = '5531986495624';
  const MSG = {
    agendar: 'Oi Júlia! Vim pelo seu link e quero agendar um horário.',
    valores: 'Oi Júlia! Vim pelo seu link e quero agendar / saber valores.',
    duvida: 'Oi Júlia! Vim pelo seu link e tenho uma dúvida sobre os cuidados com a minha perfuração.'
  };

  // Prova social: fotos reais de clientes, por nome de arquivo:
  // assets/clientes/cliente-01.jpg, cliente-02.jpg ... (até 12).
  // Só aparecem as fotos que existirem; sem nenhuma foto, a grade fica escondida (os vídeos fazem a prova).
  const CLIENTES_MAX = 12;
  const EXT = 'jpg';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------- WhatsApp com mensagem pronta ---------------- */
  $$('[data-wa]').forEach(a => {
    const m = MSG[a.dataset.wa] || MSG.agendar;
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;
  });

  /* ---------------- Arte da onça (Codex) ---------------- */
  const onca = $('[data-onca]');
  const base = $('.onca__base', onca);
  let oncaOk = true;
  const markMissing = () => { oncaOk = false; onca.classList.add('onca--missing'); };
  if (base.complete && base.naturalWidth === 0) markMissing();
  base.addEventListener('error', markMissing);
  $$('.onca__eyes, .onca__glow', onca).forEach(img => img.addEventListener('error', () => { img.style.display = 'none'; }));

  /* ---------------- Prova social: fotos de clientes ---------------- */
  const proofEl = $('[data-proof]');
  for (let n = 1; n <= CLIENTES_MAX; n++) {
    const file = `cliente-${String(n).padStart(2, '0')}.${EXT}`;
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.hidden = true;
    // Mostra a foto original só se o arquivo existir (sem imagem quebrada nem espaço vazio).
    const probe = new Image();
    probe.onload = () => {
      probe.alt = `Perfuração feita pela Júlia, foto ${n}`;
      probe.decoding = 'async';
      fig.append(probe);
      fig.hidden = false;
      proofEl.hidden = false;
    };
    probe.src = `assets/clientes/${file}`;
    proofEl.append(fig);
  }

  /* ---------------- Vídeos da Júlia ---------------- */
  // Toca no próprio card, sempre. Nunca leva a pessoa para o Instagram.
  $$('[data-reel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = document.createElement('video');
      v.src = btn.dataset.mp4;
      v.poster = $('img', btn).src;
      v.controls = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.className = 'reel__video';
      v.setAttribute('controlslist', 'nodownload');
      v.addEventListener('play', () => {
        $$('.reel__video').forEach(o => { if (o !== v) o.pause(); });
      });
      v.addEventListener('error', () => {
        // Arquivo indisponível: volta para a capa, sem redirecionar.
        v.replaceWith(btn);
      }, { once: true });
      btn.replaceWith(v);
      v.play().catch(() => {});
    });
  });

  /* ---------------- Toque: anel dourado ---------------- */
  if (!reduce) {
    document.addEventListener('pointerdown', e => {
      const el = e.target.closest('.btn');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'tap';
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.append(s);
      s.addEventListener('animationend', () => s.remove());
    }, { passive: true });
  }

  /* ================================================================
     CANVAS DE ROSETAS
     ================================================================ */
  const cv = $('#fx');
  const ctx = cv.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  // Gerador determinístico (manchas iguais a cada abertura).
  let seed = 20201;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const rr = (a, b) => a + (b - a) * rnd();

  // Sprites de roseta (anel irregular de manchas, como na pelagem da onça).
  const SPR = 72;
  function makeRosette(color, kind) {
    const c = document.createElement('canvas');
    c.width = c.height = SPR;
    const g = c.getContext('2d');
    g.translate(SPR / 2, SPR / 2);
    g.fillStyle = color;
    if (kind === 'spot') {
      g.beginPath();
      g.ellipse(0, 0, rr(14, 20), rr(10, 16), rr(0, Math.PI), 0, Math.PI * 2);
      g.fill();
      return c;
    }
    const n = 4 + Math.floor(rnd() * 3);
    const R = rr(19, 24);
    let a = rnd() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const span = (Math.PI * 2) / n;
      const ang = a + span * k + rr(-0.15, 0.15);
      g.save();
      g.rotate(ang);
      g.beginPath();
      g.ellipse(R, 0, rr(4.5, 7.5), span * R * rr(0.3, 0.42), rr(-0.3, 0.3), 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    const dots = Math.floor(rr(0, 3));
    for (let k = 0; k < dots; k++) {
      g.beginPath();
      g.arc(rr(-6, 6), rr(-6, 6), rr(2.5, 4.5), 0, Math.PI * 2);
      g.fill();
    }
    return c;
  }
  const GOLD = ['#e9b54f', '#f2c76a', '#d99a35', '#f6d68c'];
  const sprites = [];
  for (let i = 0; i < 10; i++) sprites.push(makeRosette(GOLD[i % GOLD.length], 'rosette'));
  const spots = [];
  for (let i = 0; i < 6; i++) spots.push(makeRosette(GOLD[i % GOLD.length], 'spot'));

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sizeFur();
    dirty = true;
  }

  /* ---- Camadas de rosetas do Codex (fundo distante e médio) ---- */
  const furLayers = $$('.bgfur__l').map((el, i) => ({ el, d: [0.18, 0.42][i] }));
  let tileH = 0;
  function sizeFur() {
    const tileW = Math.min(W, 600);
    tileH = Math.round(tileW * 1920 / 1080);
    root.style.setProperty('--tile-w', `${tileW}px`);
    root.style.setProperty('--tile-h', `${tileH}px`);
  }
  function moveFur(sy) {
    if (reduce || !tileH) return;
    for (const l of furLayers) l.el.style.transform = `translate3d(0, ${-((sy * l.d) % tileH)}px, 0)`;
  }

  /* ---- Rosetas do canvas: só a camada próxima, por cima das camadas do Codex ---- */
  let bg = [];
  let bgAlpha = reduce ? 1 : 0;
  function buildBackground() {
    seed = 777;
    const docH = Math.max(document.documentElement.scrollHeight, H);
    const count = Math.min(40, Math.max(12, Math.round((docH * W) / 60000)));
    bg = [];
    for (let i = 0; i < count; i++) {
      const layer = 0.8;
      const depth = reduce ? 1 : layer; // perto = maior, mais rápido, um pouco mais visível
      const travel = (docH - H) * depth + H;
      bg.push({
        x: rr(-20, W + 20),
        y: rr(-20, travel + 20),
        d: depth,
        s: (layer === 0.8 ? rr(30, 52) : layer === 0.5 ? rr(18, 30) : rr(10, 18)),
        a: (layer === 0.8 ? rr(0.07, 0.13) : layer === 0.5 ? rr(0.08, 0.14) : rr(0.1, 0.17)),
        rot: rr(0, Math.PI * 2),
        spr: sprites[i % sprites.length]
      });
    }
    dirty = true;
  }

  /* ---- Partículas animadas (abertura e explosões das seções) ---- */
  let parts = [];
  let bursts = [];
  let nameAnchor = { x: 0, y: 0 };
  const nameEl = document.getElementById('nome');
  let dirty = true;
  let running = false;
  const easeExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeCubic = t => 1 - Math.pow(1 - t, 3);

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    const sy = window.scrollY;
    moveFur(sy);

    // fundo
    if (bgAlpha > 0) {
      for (const r of bg) {
        const y = r.y - sy * r.d;
        if (y < -60 || y > H + 60) continue;
        ctx.globalAlpha = r.a * bgAlpha;
        ctx.save();
        ctx.translate(r.x, y);
        ctx.rotate(reduce ? r.rot : r.rot + sy * 0.0006 * (r.d - 0.5));
        ctx.drawImage(r.spr, -r.s / 2, -r.s / 2, r.s, r.s);
        ctx.restore();
      }
    }

    let alive = false;

    // partículas que formam o nome (seguem o h1 se o layout mudar ou a página rolar)
    let offX = 0, offY = 0;
    if (parts.length) {
      const hr = nameEl.getBoundingClientRect();
      offX = hr.left - nameAnchor.x; offY = hr.top - nameAnchor.y;
    }
    for (const p of parts) {
      let x, y, a, s;
      const t = now - p.t0;
      if (p.phase === 'form') {
        const k = Math.min(1, Math.max(0, t / p.dur));
        const e = easeExpo(k);
        const swirl = Math.sin(Math.PI * k) * p.swirl;
        x = p.sx + (p.tx + offX - p.sx) * e + p.nx * swirl;
        y = p.sy + (p.ty + offY - p.sy) * e + p.ny * swirl;
        a = Math.min(1, k * 2.2);
        s = p.size * (0.5 + 0.5 * e);
        if (k < 1) alive = true;
      } else { // 'out'
        const k = Math.min(1, Math.max(0, (now - p.o0) / p.odur));
        const e = easeCubic(k);
        x = p.tx + offX + p.ox * e;
        y = p.ty + offY + p.oy * e;
        a = 1 - k;
        s = p.size * (1 + 0.8 * e);
        if (k < 1) alive = true;
      }
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(p.spr, x - s / 2, y - s / 2, s, s);
    }

    // explosões de rosetas ao revelar seções (coordenadas do documento)
    for (const b of bursts) {
      const k = Math.min(1, (now - b.t0) / b.dur);
      if (k >= 1) continue;
      alive = true;
      const e = easeExpo(k);
      for (const r of b.items) {
        const x = b.x + r.dx * e;
        const y = b.y - sy + r.dy * e;
        ctx.globalAlpha = r.a * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r.rot + e * r.spin);
        ctx.drawImage(r.spr, -r.s / 2, -r.s / 2, r.s, r.s);
        ctx.restore();
      }
    }
    bursts = bursts.filter(b => now - b.t0 < b.dur);
    if (parts.length && parts.every(p => p.phase === 'out' && now - p.o0 > p.odur)) parts = [];
    ctx.globalAlpha = 1;
    return alive;
  }

  function loop(now) {
    const alive = draw(now);
    if (alive || fading) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      dirty = false;
    }
  }
  function kick() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  // Fade-in das rosetas do fundo
  let fading = false;
  function fadeInBackground(ms) {
    const t0 = performance.now();
    fading = true;
    const step = now => {
      bgAlpha = Math.min(1, (now - t0) / ms);
      if (bgAlpha < 1) requestAnimationFrame(step); else fading = false;
    };
    requestAnimationFrame(step);
    kick();
  }

  function burstAt(x, docY) {
    if (reduce) return;
    seed = (Math.floor(docY) % 9973) + 13;
    const items = [];
    for (let i = 0; i < 16; i++) {
      const ang = rr(0, Math.PI * 2);
      const dist = rr(50, Math.min(W * 0.6, 220));
      items.push({
        dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist * 0.7,
        s: rr(10, 26), a: rr(0.25, 0.55),
        rot: rr(0, 6.28), spin: rr(-0.8, 0.8),
        spr: sprites[i % sprites.length]
      });
    }
    bursts.push({ x, y: docY, t0: performance.now(), dur: 1500, items });
    kick();
  }

  /* ---- Pontos das letras: desenha o nome no mesmo lugar do h1 e amostra ---- */
  function sampleName() {
    const h1 = $('#nome');
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const g = off.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff';
    g.textBaseline = 'alphabetic';
    g.textAlign = 'left';

    const groups = [];
    $$('span', h1).forEach(span => {
      const cs = getComputedStyle(span);
      g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const node = span.firstChild;
      const text = node.textContent;
      const range = document.createRange();
      const rect = span.getBoundingClientRect();
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') continue;
        range.setStart(node, i); range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        const m = g.measureText(text[i]);
        const asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
        g.fillText(text[i], r.left, r.top + asc);
      }
      groups.push({ rect, size: parseFloat(cs.fontSize) });
    });

    const hr = h1.getBoundingClientRect();
    nameAnchor = { x: hr.left, y: hr.top };
    const pts = [];
    const data = g.getImageData(0, 0, W, H).data;
    groups.forEach((grp, gi) => {
      const step = Math.max(2.2, grp.size / (gi === 0 ? 14 : 6.5));
      const x0 = Math.max(0, Math.floor(grp.rect.left - 4)), x1 = Math.min(W, Math.ceil(grp.rect.right + 4));
      const y0 = Math.max(0, Math.floor(grp.rect.top - 4)), y1 = Math.min(H, Math.ceil(grp.rect.bottom + 4));
      for (let y = y0; y < y1; y += step) {
        for (let x = x0; x < x1; x += step) {
          const jx = x + rr(-step * 0.3, step * 0.3), jy = y + rr(-step * 0.3, step * 0.3);
          const ix = Math.round(jx), iy = Math.round(jy);
          if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
          if (data[(iy * W + ix) * 4 + 3] > 128) pts.push({ x: jx, y: jy, size: step * (gi === 0 ? 1.9 : 1.6), main: gi === 0 });
        }
      }
    });
    return pts.slice(0, 900);
  }

  /* ================================================================
     ABERTURA
     ================================================================ */
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    root.classList.add('s-face', 's-eyes', 's-name', 's-rest');
    root.classList.remove('intro-run');
    root.classList.add('intro-done');
    const now = performance.now();
    parts.forEach(p => { if (p.phase === 'form') { p.phase = 'out'; p.o0 = now; p.odur = 500; } });
    if (bgAlpha < 1) fadeInBackground(500);
    removeSkip();
  }

  const skipEvents = ['pointerdown', 'wheel', 'touchmove', 'keydown'];
  function onSkip() { finishIntro(); }
  function removeSkip() { skipEvents.forEach(ev => window.removeEventListener(ev, onSkip)); }

  function startIntro() {
    if (!root.classList.contains('intro-run')) { // reduced-motion ou já passou do tempo de segurança
      root.classList.add('intro-done');
      return;
    }
    if (window.scrollY > 40) { finishIntro(); return; }
    skipEvents.forEach(ev => window.addEventListener(ev, onSkip, { passive: true }));

    const pts = sampleName();
    const heroRect = onca.getBoundingClientRect();
    const fcx = heroRect.left + heroRect.width / 2;
    const fcy = heroRect.top + heroRect.height * 0.45;
    const fr = heroRect.width * 0.42;
    seed = 4242;
    const T0 = 650; // começa enquanto o rosto ainda está surgindo
    const now0 = performance.now() + T0;
    const nameMinX = Math.min(...pts.map(p => p.x)), nameMaxX = Math.max(...pts.map(p => p.x));

    parts = pts.map((p, i) => {
      // manchas saem da pelagem do rosto e se organizam em letras
      const ang = rr(0, Math.PI * 2), rad = Math.sqrt(rnd()) * fr;
      const sx = fcx + Math.cos(ang) * rad, sy = fcy + Math.sin(ang) * rad * 0.9;
      const dx = p.x - sx, dy = p.y - sy, len = Math.hypot(dx, dy) || 1;
      const sweep = (p.x - nameMinX) / Math.max(1, nameMaxX - nameMinX); // varre da esquerda para a direita
      return {
        sx, sy, tx: p.x, ty: p.y,
        nx: -dy / len, ny: dx / len,
        swirl: rr(-50, 50),
        size: p.size * rr(0.85, 1.2),
        spr: (i % 3 === 0 ? spots : sprites)[i % (i % 3 === 0 ? spots.length : sprites.length)],
        t0: now0 + sweep * 520 + rr(0, 260),
        dur: rr(1050, 1350),
        phase: 'form',
        ox: rr(-1, 1) * rr(30, 120), oy: rr(-1, 1) * rr(30, 120)
      };
    });
    kick();

    at(0, () => root.classList.add('s-face'));
    at(oncaOk ? 700 : 200, () => root.classList.add('s-eyes'));
    const formed = T0 + 520 + 260 + 1350; // ~2.8s
    at(formed + 150, () => root.classList.add('s-name'));
    at(formed + 380, () => {
      const now = performance.now();
      parts.forEach(p => { p.phase = 'out'; p.o0 = now + rr(0, 200); p.odur = rr(800, 1100); });
      fadeInBackground(1400);
      kick();
    });
    at(formed + 560, () => root.classList.add('s-rest'));
    at(formed + 1700, () => {
      finished = true;
      root.classList.remove('intro-run');
      root.classList.add('intro-done');
      removeSkip();
    });
  }

  /* ================================================================
     REVELAÇÃO DAS SEÇÕES
     ================================================================ */
  function setupReveal() {
    const items = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
        if (el.classList.contains('section') && root.classList.contains('intro-done')) {
          const t = $('.section__title', el).getBoundingClientRect();
          burstAt(t.left + Math.min(t.width, W) * 0.35, t.top + t.height / 2 + window.scrollY);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }

  /* ================================================================
     START
     ================================================================ */
  resize();
  window.addEventListener('resize', () => { resize(); buildBackground(); kick(); }, { passive: true });
  window.addEventListener('scroll', () => { dirty = true; kick(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.race([
        Promise.all([document.fonts.load('600 48px Poppins'), document.fonts.load('400 16px Poppins')]),
        new Promise(r => setTimeout(r, 800))
      ])
    : Promise.resolve();

  fontsReady.then(() => {
    buildBackground();
    setupReveal();
    startIntro();
    kick();
    // a altura da página muda quando o mapa e as fotos carregam
    window.addEventListener('load', () => { buildBackground(); kick(); });
  });
})();
