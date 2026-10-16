/* ====== Actividad 3 · interactividad avanzada ====== */
(function () {
  /* ---------- loader ---------- */
  window.addEventListener('load', () => {
    const l = document.getElementById('loader');
    setTimeout(() => { l.classList.add('hide'); }, 500);
    setTimeout(() => { l.remove(); }, 1100);
  });

  /* ---------- partículas ---------- */
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  let W, H, parts = [];
  const COLORS = ['#F28C1E', '#7A4FB5', '#2BB3A3', '#E0457B'];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  function makeParts() {
    const n = Math.min(70, Math.floor(innerWidth / 22));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * 0.4 + 0.15,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = document.querySelector('.slide.is-active')?.classList.contains('slide--dark');
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = dark ? p.a : p.a * 0.35;
      ctx.fill();
    }
    // líneas entre cercanas
    ctx.globalAlpha = dark ? 0.08 : 0.04;
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = dx * dx + dy * dy;
        if (d < 12000) {
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = '#9d7fd0';
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  resize(); makeParts(); draw();
  addEventListener('resize', () => { resize(); makeParts(); });

  /* ---------- navegación ---------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let idx = 0;
  const elProgress = document.getElementById('progress');
  const elCurrent = document.getElementById('current');
  const elTotal = document.getElementById('total');
  const btnPrev = document.getElementById('prev');
  const btnNext = document.getElementById('next');
  const dotsWrap = document.getElementById('dots');
  elTotal.textContent = total;

  const dots = [];
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Diapositiva ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b); dots.push(b);
  }
  const homeBtn = document.createElement('button');
  homeBtn.className = 'home'; homeBtn.textContent = '☰ Menú';
  homeBtn.addEventListener('click', () => go(1));
  dotsWrap.appendChild(homeBtn);
  const fsBtn = document.createElement('button');
  fsBtn.className = 'fsbtn'; fsBtn.textContent = '⛶'; fsBtn.title = 'Pantalla completa (F)';
  fsBtn.addEventListener('click', toggleFs);
  dotsWrap.appendChild(fsBtn);

  function replay(slide) {
    slide.querySelectorAll('.anim, .stagger > *').forEach((el) => {
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
    animateNumbers(slide);
    animateBars(slide);
  }

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === idx) return;
    slides[idx].classList.remove('is-active');
    slides[n].classList.add('is-active');
    idx = n;
    replay(slides[idx]);
    update();
  }
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  function update() {
    elProgress.style.width = ((idx + 1) / total) * 100 + '%';
    elCurrent.textContent = idx + 1;
    btnPrev.style.visibility = idx === 0 ? 'hidden' : 'visible';
    btnNext.style.visibility = idx === total - 1 ? 'hidden' : 'visible';
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
  }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  document.querySelectorAll('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => go(parseInt(b.dataset.goto, 10))));

  /* ---------- contadores animados ---------- */
  function animateNumbers(slide) {
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suf = el.dataset.suffix || '';
      const dur = 1200; const t0 = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suf;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  /* ---------- barras ---------- */
  function animateBars(slide) {
    slide.querySelectorAll('[data-fill]').forEach((el) => {
      el.style.width = '0';
      setTimeout(() => { el.style.width = el.dataset.fill + '%'; }, 120);
    });
  }

  /* ---------- tema ---------- */
  document.getElementById('theme').addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
  });

  /* ---------- teclado / rueda / táctil ---------- */
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(total - 1);
    else if (e.key === 'f' || e.key === 'F') toggleFs();
    else if (e.key === 'm' || e.key === 'M') go(1);
  });
  let wheelLock = false;
  addEventListener('wheel', (e) => {
    if (wheelLock) return; wheelLock = true;
    setTimeout(() => (wheelLock = false), 800);
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });
  let x0 = null;
  addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    x0 = null;
  }, { passive: true });

  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  replay(slides[0]);
  update();
})();
