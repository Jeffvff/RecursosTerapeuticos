// Inicializar ícones Lucide
    lucide.createIcons();

    // ===== CONFIG DO POPUP UPSELL =====
    var UPSELL = {
      checkoutPagina:   'https://pay.wiapy.com/u8Lr8FTWrd',
      checkoutCompleto: 'https://pay.wiapy.com/Dc-HpAeSV',
      checkoutBasico:   'https://pay.wiapy.com/jAOcPoRUye',
      precoOriginal:    'R$37,90',
      precoDesconto:    'R$29,90'
    };

    // ===== REDIRECIONAMENTO COM PARÂMETROS =====
    function irParaCheckout(url) {
      try {
        var dest = new URL(url);
        new URLSearchParams(window.location.search).forEach(function(v, k) {
          dest.searchParams.set(k, v);
        });
        window.location.href = dest.toString();
      } catch(e) {
        window.location.href = url + window.location.search;
      }
    }

    // ===== POPUP UPSELL =====
    (function() {
      var overlay  = document.getElementById('upsell-overlay');
      var btnYes   = document.getElementById('upsell-btn-yes');
      var btnNo    = document.getElementById('upsell-btn-no');
      var btnClose = document.getElementById('upsell-close');
      var trigger  = document.getElementById('btn-basico-trigger');
      var btnCompletoLink = document.getElementById('btn-completo-link');

      // Preenche preços dinamicamente
      document.getElementById('upsell-old-price').textContent = UPSELL.precoOriginal;
      var newEl = document.getElementById('upsell-new-price');
      var parts = UPSELL.precoDesconto.replace('R$','').split(',');
      newEl.innerHTML = '<sup>R$</sup>' + parts[0] + (parts[1] ? '<sup>,' + parts[1] + '</sup>' : '');

      if (btnCompletoLink) {
        btnCompletoLink.addEventListener('click', function(e) {
          e.preventDefault();
          irParaCheckout(UPSELL.checkoutPagina);
        });
      }

      function openPopup(e) {
        e.preventDefault();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closePopup() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      btnYes.addEventListener('click', function(e) {
        e.preventDefault();
        irParaCheckout(UPSELL.checkoutCompleto);
      });

      function goBasico() {
        closePopup();
        irParaCheckout(UPSELL.checkoutBasico);
      }

      if (trigger) trigger.addEventListener('click', openPopup);
      btnClose.addEventListener('click', closePopup);
      btnNo.addEventListener('click', goBasico);

      // Fechar clicando fora do card
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closePopup();
      });

      // Fechar com ESC
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePopup();
      });
    })();

    // ===== Carrossel de Depoimentos =====
    (function() {
      var track = document.querySelector('.t-track');
      var dots  = document.querySelectorAll('.t-dot');
      var prev  = document.querySelector('.t-prev');
      var next  = document.querySelector('.t-next');
      if (!track) return;
      var total = document.querySelectorAll('.t-slide').length;
      var cur = 0, timer, startX = 0;

      function goTo(idx) {
        cur = (idx + total) % total;
        track.style.transform = 'translateX(-' + (cur * 100) + '%)';
        dots.forEach(function(d, i) { d.classList.toggle('active', i === cur); });
      }
      function resetAuto() { clearInterval(timer); timer = setInterval(function() { goTo(cur + 1); }, 5000); }

      prev.addEventListener('click', function() { goTo(cur - 1); resetAuto(); });
      next.addEventListener('click', function() { goTo(cur + 1); resetAuto(); });
      dots.forEach(function(d, i) { d.addEventListener('click', function() { goTo(i); resetAuto(); }); });

      track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive:true});
      track.addEventListener('touchend', function(e) {
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { goTo(cur + (diff > 0 ? 1 : -1)); resetAuto(); }
      });

      resetAuto();
    })();

    // ===== Countdown até fim do dia =====
    (function() {
      var targets = [
        document.getElementById('countdown-timer'),
        document.getElementById('urgency-countdown')
      ];
      function tick() {
        var now = new Date();
        var midnight = new Date(now);
        midnight.setHours(23, 59, 59, 999);
        var diff = Math.max(0, midnight - now);
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        var str = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        targets.forEach(function(el) { if (el) el.textContent = str; });
      }
      tick();
      setInterval(tick, 1000);
    })();

    // ===== FAQ Accordion =====
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');

        // Fechar todos
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('active');
          i.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Abrir o clicado se não estava ativo
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    // ===== Smooth scroll para âncoras internas (robusto) =====
    (function() {
      var duration = 600;

      function smoothScrollTo(targetY, cb) {
        var startY = window.scrollY || window.pageYOffset;
        var diff = targetY - startY;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var t = Math.min(1, (ts - startTime) / duration);
          var ease = 0.5 - Math.cos(t * Math.PI) / 2; // easeInOut
          window.scrollTo(0, Math.round(startY + diff * ease));
          if (t < 1) requestAnimationFrame(step);
          else if (typeof cb === 'function') cb();
        }

        requestAnimationFrame(step);
      }

      document.addEventListener('click', function(e) {
        var el = e.target;
        while (el && el !== document) {
          if (el.tagName && el.tagName.toLowerCase() === 'a') {
            var href = el.getAttribute('href');
            if (href && href.indexOf('#') === 0 && href !== '#') {
              var target = document.querySelector(href);
              if (target) {
                e.preventDefault();
                var offset = 12; // adjust if you have a fixed header
                var rect = target.getBoundingClientRect();
                var targetY = window.scrollY + rect.top - offset;
                smoothScrollTo(targetY, function() {
                  try { history.pushState(null, null, href); } catch (err) { location.hash = href; }
                  try { target.focus({ preventScroll: true }); } catch (e) {}
                });
              }
            }
            break;
          }
          el = el.parentNode;
        }
      }, { passive: false });
    })();
