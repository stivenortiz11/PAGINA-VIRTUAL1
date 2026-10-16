/* ====== Actividad 3 · navegación de diapositivas ====== */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let idx = 0;

  const elProgress = document.getElementById('progress');
  const elCurrent = document.getElementById('current');
  const elTotal = document.getElementById('total');
  const btnPrev = document.getElementById('prev');
  const btnNext = document.getElementById('next');
  const btnHome = document.getElementById('home');

  elTotal.textContent = total;

  function show(n, dir) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === idx) return;
    const saliente = slides[idx];
    const entrante = slides[n];

    saliente.classList.remove('is-active');
    saliente.classList.add('is-leaving');
    setTimeout(() => saliente.classList.remove('is-leaving'), 600);

    entrante.classList.add('is-active');
    idx = n;
    update();
  }

  function update() {
    elProgress.style.width = ((idx + 1) / total) * 100 + '%';
    elCurrent.textContent = idx + 1;
    btnPrev.style.visibility = idx === 0 ? 'hidden' : 'visible';
    btnNext.style.visibility = idx === total - 1 ? 'hidden' : 'visible';
  }

  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnHome.addEventListener('click', () => show(1)); // diapositiva 2 = menú

  // Botones internos que saltan a una diapositiva (data-goto = índice 0-based)
  document.querySelectorAll('[data-goto]').forEach((b) => {
    b.addEventListener('click', () => show(parseInt(b.dataset.goto, 10)));
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { show(0); }
    else if (e.key === 'End') { show(total - 1); }
    else if (e.key === 'f' || e.key === 'F') { toggleFs(); }
  });

  // Rueda del mouse (con pequeño bloqueo para no saltar varias)
  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    wheelLock = true;
    setTimeout(() => (wheelLock = false), 700);
    if (e.deltaY > 0) next(); else prev();
  }, { passive: true });

  // Swipe táctil
  let x0 = null;
  window.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    x0 = null;
  }, { passive: true });

  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  update();
})();
