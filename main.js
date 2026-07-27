/* =====================================================================
   AI Grocery Planner — landing page behavior
   Vanilla JS, no dependencies. Progressive enhancement: the page is
   fully readable with JS disabled.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------
     Analytics hook
     Replace this stub with your provider (GA4 gtag, Plausible, PostHog…).
     Every element with [data-cta] fires track('cta_click', { cta }).
     ----------------------------------------------------------------- */
  window.track = window.track || function (event, props) {
    // e.g. window.gtag && gtag('event', event, props);
    if (window.console && console.debug) console.debug('[track]', event, props || {});
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (el) window.track('cta_click', { cta: el.getAttribute('data-cta') });
  });

  /* -------------------------------------------------------------------
     Sticky-nav elevation + mobile menu
     ----------------------------------------------------------------- */
  var nav = document.querySelector('[data-nav]');
  var burger = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-menu]');

  function onScrollNav() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  // Close the mobile menu if the viewport grows past the desktop breakpoint.
  window.matchMedia('(min-width: 940px)').addEventListener('change', function (m) {
    if (m.matches) setMenu(false);
  });

  /* -------------------------------------------------------------------
     Scroll reveals (IntersectionObserver)
     ----------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------------
     Hero phone parallax (gentle, reduced-motion-safe)
     ----------------------------------------------------------------- */
  var scope = document.querySelector('[data-parallax-scope]');
  var layers = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-parallax]')) : [];
  if (scope && layers.length && !reduceMotion) {
    var ticking = false;
    var apply = function () {
      var rect = scope.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // -1 (below) .. 1 (above) relative to viewport centre
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      layers.forEach(function (el) {
        var depth = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = (el.dataset.baseTransform || '') +
          ' translate3d(0,' + (progress * depth * -1).toFixed(2) + 'px,0)';
      });
      ticking = false;
    };
    // Preserve each layer's authored rotate() so parallax composes with it.
    layers.forEach(function (el) {
      var t = getComputedStyle(el).transform;
      el.dataset.baseTransform = (t && t !== 'none') ? t : '';
    });
    var onScrollPar = function () {
      if (!ticking) { window.requestAnimationFrame(apply); ticking = true; }
    };
    window.addEventListener('scroll', onScrollPar, { passive: true });
    window.addEventListener('resize', onScrollPar, { passive: true });
    apply();
  }

  /* -------------------------------------------------------------------
     Pricing: monthly / annual toggle
     ----------------------------------------------------------------- */
  var toggle = document.querySelector('[data-price-toggle]');
  if (toggle) {
    var buttons = Array.prototype.slice.call(toggle.querySelectorAll('button'));
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var period = btn.getAttribute('data-period');
      buttons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      document.querySelectorAll('[data-price]').forEach(function (p) {
        var val = p.getAttribute('data-' + period);
        if (val) p.textContent = val;
      });
      document.querySelectorAll('[data-per]').forEach(function (per) {
        per.textContent = period === 'annual' ? '/mo, billed yearly' : '/mo';
      });
      window.track('pricing_toggle', { period: period });
    });
  }

  /* -------------------------------------------------------------------
     Screenshots: light / dark
     Every product shot ships as <picture class="shot"> with a dark <source>
     gated on prefers-color-scheme, so with JS off the phones already match
     the visitor's own theme. Here we add a switch that pins either one:
     flipping source.media between 'all' and 'not all' re-runs the picture
     selection without touching a single src.
     ----------------------------------------------------------------- */
  (function initShots() {
    var toggleEl = document.querySelector('[data-shot-toggle]');
    var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    var mode = 'auto'; // 'auto' | 'light' | 'dark'

    function paint() {
      var dark = mode === 'dark' || (mode === 'auto' && darkMq.matches);
      document.documentElement.setAttribute('data-shots', dark ? 'dark' : 'light');
      if (mode !== 'auto') {
        var media = mode === 'dark' ? 'all' : 'not all';
        document.querySelectorAll('picture.shot > source[data-dark]').forEach(function (s) {
          s.media = media;
        });
      }
      if (toggleEl) {
        toggleEl.querySelectorAll('button[data-shot-mode]').forEach(function (b) {
          b.setAttribute('aria-pressed', b.getAttribute('data-shot-mode') === (dark ? 'dark' : 'light') ? 'true' : 'false');
        });
      }
    }

    paint();
    darkMq.addEventListener('change', function () { if (mode === 'auto') paint(); });

    if (toggleEl) {
      toggleEl.hidden = false;
      toggleEl.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-shot-mode]');
        if (!btn) return;
        mode = btn.getAttribute('data-shot-mode');
        paint();
        window.track('shots_theme', { theme: mode });
      });
    }
  })();

  /* -------------------------------------------------------------------
     Waitlist form — submits to Web3Forms (see the hidden access_key
     input in index.html). Every signup lands as an email; no backend
     or database required. Swap the access_key to route signups to a
     different inbox, or replace this handler entirely once you have
     a real list provider (Mailchimp, ConvertKit, Supabase table, ...).
     ----------------------------------------------------------------- */
  var form = document.querySelector('[data-waitlist]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      var email = input ? input.value.trim() : '';
      var btn = form.querySelector('button[type="submit"]');
      var btnLabel = btn ? btn.textContent : '';

      form.classList.remove('is-error');
      if (btn) { btn.disabled = true; btn.textContent = 'Joining…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            window.track('waitlist_signup', { email_domain: (email.split('@')[1] || '') });
            form.classList.add('is-done');
          } else {
            form.classList.add('is-error');
          }
        })
        .catch(function () { form.classList.add('is-error'); })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        });
    });
  }

  /* -------------------------------------------------------------------
     Footer year
     ----------------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------------------
     Zeb — live scroll guide
     A floating buddy whose speech bubble swaps to match the section in
     view (each section carries a data-zeb-tip line). Progressive
     enhancement: markup ships [hidden]; we only reveal it here. Fully
     dismissible and calm when the visitor prefers reduced motion.
     ----------------------------------------------------------------- */
  (function initZeb() {
    var guide = document.querySelector('[data-zeb-guide]');
    if (!guide) return;

    var textEl = guide.querySelector('[data-zeb-text]');
    var toggleBtn = guide.querySelector('[data-zeb-toggle]');
    var closeBtn = guide.querySelector('[data-zeb-close]');
    var tipEls = Array.prototype.slice.call(document.querySelectorAll('[data-zeb-tip]'));
    var currentTip = null;
    var dismissed = false;

    // Reveal the guide (respect a returning visitor who dismissed it)
    try { dismissed = window.sessionStorage.getItem('zeb-dismissed') === '1'; } catch (e) {}
    guide.hidden = false;
    if (dismissed) guide.classList.add('is-collapsed');
    window.setTimeout(function () { guide.classList.add('is-in'); }, 600);

    function setText(msg) {
      if (!textEl || msg === currentTip) return;
      currentTip = msg;
      if (reduceMotion) { textEl.textContent = msg; return; }
      textEl.classList.add('is-swapping');
      window.setTimeout(function () {
        textEl.textContent = msg;
        textEl.classList.remove('is-swapping');
      }, 200);
    }

    function markEngaged() {
      guide.classList.add('has-engaged'); // stops the attention ping
    }

    // Expand / collapse the bubble by tapping Zeb
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        markEngaged();
        var nowCollapsed = guide.classList.toggle('is-collapsed');
        try { window.sessionStorage.setItem('zeb-dismissed', nowCollapsed ? '1' : '0'); } catch (e) {}
        window.track('zeb_toggle', { open: !nowCollapsed });
      });
    }
    // The × just tucks Zeb away (keeps the little button so he's recallable)
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        markEngaged();
        guide.classList.add('is-collapsed');
        try { window.sessionStorage.setItem('zeb-dismissed', '1'); } catch (e2) {}
        window.track('zeb_dismiss', {});
      });
    }

    // Swap the tip to whichever tagged section is most in view
    if (tipEls.length && 'IntersectionObserver' in window) {
      var visible = {};
      var zio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = tipEls.indexOf(entry.target);
          if (entry.isIntersecting) visible[id] = entry.intersectionRatio;
          else delete visible[id];
        });
        // pick the most-visible tagged section
        var bestId = null, bestRatio = 0;
        Object.keys(visible).forEach(function (k) {
          if (visible[k] > bestRatio) { bestRatio = visible[k]; bestId = k; }
        });
        if (bestId !== null) {
          var tip = tipEls[bestId].getAttribute('data-zeb-tip');
          if (tip) setText(tip);
        }
      }, { threshold: [0.15, 0.4, 0.7], rootMargin: '-20% 0px -30% 0px' });
      tipEls.forEach(function (el) { zio.observe(el); });
    }
  })();
})();
