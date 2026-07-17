(function () {
  var root = document.getElementById('sales-pop');
  if (!root) return;

  var card = root.querySelector('.sales-pop__card');
  var closeButton = root.querySelector('.sales-pop__close');
  var nameEl = root.querySelector('.sales-pop__name');
  var locationEl = root.querySelector('.sales-pop__location');
  var productEl = root.querySelector('.sales-pop__product');
  var timeEl = root.querySelector('.sales-pop__time');

  var demoSales = [
    { name: 'Fernanda', city: 'São Paulo', state: 'SP', product: 'Kit Completo', time: 'há 1 minuto' },
    { name: 'Mariana', city: 'Goiânia', state: 'GO', product: 'Kit Clínica Lúdica', time: 'há 18 minutos' },
    { name: 'Camila', city: 'Belo Horizonte', state: 'MG', product: 'Kit Completo', time: 'há 1 hora' },
    { name: 'Juliana', city: 'Curitiba', state: 'PR', product: 'Kit Completo', time: 'há 2 horas' },
    { name: 'Larissa', city: 'Recife', state: 'PE', product: 'Kit Clínica Lúdica', time: 'há 3 horas' },
    { name: 'Amanda', city: 'Brasília', state: 'DF', product: 'Kit Completo', time: 'há 5 horas' },
    { name: 'Patrícia', city: 'Salvador', state: 'BA', product: 'Kit Clínica Lúdica', time: 'há 8 horas' },
    { name: 'Beatriz', city: 'Porto Alegre', state: 'RS', product: 'Kit Completo', time: 'há 1 dia' }
  ];

  var FIRST_DELAY = 3000;
  var DISPLAY_DURATION = 15000;
  var CYCLE_DELAY = 15000;
  var EXIT_DURATION = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;

  var nextTimerId = null;
  var hideTimerId = null;
  var hideCompleteTimerId = null;
  var nextDeadline = 0;
  var hideDeadline = 0;
  var remainingNextDelay = FIRST_DELAY;
  var remainingHideDelay = DISPLAY_DURATION;
  var lastIndex = -1;
  var isVisible = false;

  function clearTimer(timerId) {
    if (timerId) {
      window.clearTimeout(timerId);
    }
    return null;
  }

  function randomIndex() {
    if (demoSales.length < 2) {
      return 0;
    }

    var index = lastIndex;
    while (index === lastIndex) {
      index = Math.floor(Math.random() * demoSales.length);
    }
    return index;
  }

  function resetFixedPosition() {
    root.style.position = '';
    root.style.left = '';
    root.style.right = '';
    root.style.top = '';
    root.style.bottom = '';
    root.style.width = '';
    root.style.maxWidth = '';
    root.style.transform = '';
  }

  function populateCard(sale) {
    nameEl.textContent = sale.name;
    locationEl.textContent = sale.city + ' • ' + sale.state;
    productEl.textContent = sale.product;
    timeEl.textContent = sale.time.toUpperCase();
  }

  function finishHide() {
    root.classList.remove('is-hiding');
    root.setAttribute('aria-hidden', 'true');
    isVisible = false;
  }

  function hideNotification() {
    if (!isVisible) return;

    hideTimerId = clearTimer(hideTimerId);
    remainingHideDelay = DISPLAY_DURATION;
    root.classList.remove('is-visible');
    root.classList.add('is-hiding');
    hideCompleteTimerId = clearTimer(hideCompleteTimerId);
    hideCompleteTimerId = window.setTimeout(finishHide, EXIT_DURATION);
    scheduleNext(CYCLE_DELAY + EXIT_DURATION);
  }

  function scheduleHide(delay) {
    hideTimerId = clearTimer(hideTimerId);
    remainingHideDelay = delay;
    hideDeadline = Date.now() + delay;
    hideTimerId = window.setTimeout(function () {
      hideNotification();
    }, delay);
  }

  function showNotification() {
    var index = randomIndex();
    var sale = demoSales[index];

    lastIndex = index;
    nextTimerId = clearTimer(nextTimerId);
    hideCompleteTimerId = clearTimer(hideCompleteTimerId);
    populateCard(sale);
    root.classList.remove('is-hiding');
    root.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(function () {
      root.classList.add('is-visible');
      isVisible = true;
    });

    scheduleHide(DISPLAY_DURATION);
  }

  function scheduleNext(delay) {
    nextTimerId = clearTimer(nextTimerId);
    remainingNextDelay = delay;
    nextDeadline = Date.now() + delay;
    nextTimerId = window.setTimeout(showNotification, delay);
  }

  function pauseTimers() {
    var now = Date.now();

    if (nextTimerId) {
      remainingNextDelay = Math.max(0, nextDeadline - now);
      nextTimerId = clearTimer(nextTimerId);
    }

    if (hideTimerId) {
      remainingHideDelay = Math.max(0, hideDeadline - now);
      hideTimerId = clearTimer(hideTimerId);
    }
  }

  function resumeTimers() {
    if (!isVisible) {
      scheduleNext(remainingNextDelay || 0);
    }

    if (isVisible) {
      scheduleHide(remainingHideDelay || 0);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      pauseTimers();
      return;
    }

    resumeTimers();
  });

  closeButton.addEventListener('click', function () {
    hideNotification();
  });

  card.addEventListener('mouseenter', function () {
    if (document.hidden) return;
    pauseTimers();
  });

  card.addEventListener('mouseleave', function () {
    if (document.hidden) return;
    resumeTimers();
  });

  resetFixedPosition();
  scheduleNext(FIRST_DELAY);
})();
