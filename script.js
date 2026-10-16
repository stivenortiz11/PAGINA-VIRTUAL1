/* ====== Actividad 3 · navegación e interactividad ====== */
(function () {
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

  // ---- construir dots + botones de menú / pantalla completa ----
  const dots = [];
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
    dots.push(b);
  }
  const homeBtn = document.createElement('button');
  homeBtn.className = 'home';
  homeBtn.textContent = '☰ Menú';
  homeBtn.addEventListener('click', () => go(1));
  dotsWrap.appendChild(homeBtn);

  const fsBtn = document.createElement('button');
  fsBtn.className = 'fsbtn';
  fsBtn.textContent = '⛶';
  fsBtn.title = 'Pantalla completa (F)';
  fsBtn.addEventListener('click', toggleFs);
  dotsWrap.appendChild(fsBtn);

  // ---- reinicia las animaciones de la diapositiva activa ----
  function replay(slide) {
    slide.querySelectorAll('.anim, .stagger > *').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth; // forzar reflow
      el.style.animation = '';
    });
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

  // saltos internos (data-goto)
  document.querySelectorAll('[data-goto]').forEach((b) => {
    b.addEventListener('click', () => go(parseInt(b.dataset.goto, 10)));
  });

  // teclado
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(total - 1);
    else if (e.key === 'f' || e.key === 'F') toggleFs();
  });

  // rueda del mouse (con bloqueo)
  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    wheelLock = true;
    setTimeout(() => (wheelLock = false), 800);
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });

  // swipe táctil
  let x0 = null;
  window.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', (e) => {
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
