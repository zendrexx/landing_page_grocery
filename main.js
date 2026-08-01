/* =====================================================================
   Zebite — landing page behavior

   Runtime: GSAP + ScrollTrigger + Lenis, all vendored under assets/vendor
   and loaded `defer` ahead of this file.

   Two guarantees hold everywhere below:

   1. The page is complete without any of this. Entrance states live behind
      a `.js` class set before first paint, and if GSAP fails to load or the
      visitor prefers reduced motion we add `.motion-off` and every element
      is simply visible. Nothing is ever stranded at opacity 0.

   2. One rAF loop for the whole page. Lenis is driven off gsap.ticker
      rather than its own requestAnimationFrame, so scroll smoothing,
      scrubbed timelines and entrance tweens all advance on the same frame.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP      = !!(window.gsap && window.ScrollTrigger);
  var animate      = hasGSAP && !reduceMotion;
  var gsap         = window.gsap;

  /* If we're not animating, drop the entrance states immediately — before
     the browser has a chance to paint a page full of invisible content. */
  if (!animate) document.documentElement.classList.add('motion-off');

  if (hasGSAP) {
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.defaults({ ease: 'expo.out', duration: 0.85 });
    // Mobile browsers fire resize on every URL-bar show/hide; without this
    // ScrollTrigger recalculates the whole page mid-scroll and stutters.
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* -------------------------------------------------------------------
     Analytics hook
     Replace this stub with your provider (GA4 gtag, Plausible, PostHog…).
     Every element with [data-cta] fires track('cta_click', { cta }).
     ----------------------------------------------------------------- */
  window.track = window.track || function (event, props) {
    if (window.console && console.debug) console.debug('[track]', event, props || {});
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (el) window.track('cta_click', { cta: el.getAttribute('data-cta') });
  });

  /* -------------------------------------------------------------------
     Smooth scroll (Lenis)
     syncTouch stays off on purpose: hijacking touch scrolling is the one
     thing people reliably hate about smooth-scroll libraries, and native
     momentum on a phone is already better than anything we'd emulate.
     ----------------------------------------------------------------- */
  var lenis = null;
  if (animate && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', window.ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Anchor links have to go through Lenis, or they fight it.
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -84, duration: 1.1 });
    });
  }

  /* -------------------------------------------------------------------
     Sticky nav: elevation, reading progress, direction-aware hide,
     sliding active-section indicator.
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
    if (lenis) open ? lenis.stop() : lenis.start();
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
  window.matchMedia('(min-width: 940px)').addEventListener('change', function (m) {
    if (m.matches) setMenu(false);
  });

  if (animate && nav) {
    var progress = nav.querySelector('[data-nav-progress]');
    if (progress) {
      gsap.to(progress, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      });
    }
    // Hide on the way down, return instantly on the way up. Never hide near
    // the top of the page, where there's nothing to reclaim.
    window.ScrollTrigger.create({
      start: 'top -160',
      end: 99999,
      onUpdate: function (self) {
        nav.classList.toggle('is-hidden', self.direction === 1);
      },
      onLeaveBack: function () { nav.classList.remove('is-hidden'); }
    });
  }

  /* Active-section pill. One element that travels, so the movement itself
     tells you which way you went. */
  (function initNavIndicator() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    var ind = document.querySelector('[data-nav-ind]');
    if (!links.length || !ind || !hasGSAP) return;

    var current = null;
    function moveTo(link) {
      if (link === current) return;
      current = link;
      links.forEach(function (l) { l.classList.toggle('is-current', l === link); });
      if (!link) { gsap.to(ind, { opacity: 0, duration: 0.2 }); return; }
      gsap.to(ind, {
        opacity: 1, x: link.offsetLeft, width: link.offsetWidth,
        duration: reduceMotion ? 0 : 0.45, ease: 'expo.out'
      });
    }

    links.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (!section) return;
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: function (self) { if (self.isActive) moveTo(link); }
      });
    });
  })();

  /* -------------------------------------------------------------------
     Reveal engine

     [data-anim="fade-up|fade|scale-in|blur-in|fade-in-l|fade-in-r|lines"]
       — the resting state is authored in CSS; here we only animate out of
         it, so the CSS and the JS can never disagree about where an
         element ends up.
     [data-anim-stagger] on a parent — its [data-anim] children arrive as
       one sequence off a single trigger.

     Every entrance uses `once: true`. A page that keeps hundreds of live
     ScrollTriggers alive after they've fired is the usual reason a
     scroll-animated site drops frames halfway down.
     ----------------------------------------------------------------- */
  if (animate) (function initReveals() {
    function isLines(el) { return el.classList.contains('lines'); }
    function lineSpans(el) { return el.querySelectorAll('.line > span'); }

    /* The CSS resting state is translateY(110%), but getComputedStyle
       reports transforms as a resolved pixel matrix — so GSAP reads it as
       `y: 47px`, and tweening yPercent to 0 would leave those pixels in
       place. Re-declaring the offset through GSAP (y:0 + yPercent:110)
       hands it the property in units it can actually cancel. */
    function primeLines(spans) { gsap.set(spans, { y: 0, yPercent: 110 }); }

    var handled = new WeakSet();

    // Grouped reveals first, so their children aren't also picked up singly.
    Array.prototype.forEach.call(document.querySelectorAll('[data-anim-stagger]'), function (group) {
      var kids = Array.prototype.slice.call(group.querySelectorAll('[data-anim]'));
      if (!kids.length) return;
      kids.forEach(function (k) { handled.add(k); });

      var plain = [], lines = [], blurred = [];
      kids.forEach(function (el) {
        if (isLines(el)) { lines.push.apply(lines, lineSpans(el)); return; }
        plain.push(el);
        if (el.getAttribute('data-anim') === 'blur-in') blurred.push(el);
      });
      if (lines.length) primeLines(lines);
      if (blurred.length) gsap.set(blurred, { filter: 'blur(10px)' });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      });
      if (plain.length) tl.to(plain, { opacity: 1, y: 0, x: 0, scale: 1, stagger: 0.08 }, 0);
      if (blurred.length) tl.to(blurred, { filter: 'blur(0px)', stagger: 0.08 }, 0);
      if (lines.length) tl.to(lines, { yPercent: 0, opacity: 1, stagger: 0.07 }, 0.05);
    });

    // Then everything standalone.
    Array.prototype.forEach.call(document.querySelectorAll('[data-anim]'), function (el) {
      if (handled.has(el)) return;
      var trigger = { trigger: el, start: 'top 88%', once: true };
      if (isLines(el)) {
        var spans = lineSpans(el);
        primeLines(spans);
        gsap.to(spans, { yPercent: 0, opacity: 1, stagger: 0.07, scrollTrigger: trigger });
        return;
      }
      if (el.getAttribute('data-anim') === 'blur-in') {
        gsap.set(el, { filter: 'blur(10px)' });
        gsap.to(el, { filter: 'blur(0px)', scrollTrigger: trigger });
      }
      gsap.to(el, { opacity: 1, y: 0, x: 0, scale: 1, scrollTrigger: trigger });
    });

    /* Problem-card icons draw themselves on. Each path's own length is
       measured so the dash maths is right for every glyph. */
    Array.prototype.forEach.call(document.querySelectorAll('.pain__ico svg'), function (svg) {
      var strokes = svg.querySelectorAll('path, circle');
      Array.prototype.forEach.call(strokes, function (s) {
        var len = 120;
        try { len = Math.ceil(s.getTotalLength()) || 120; } catch (e) {}
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(strokes, {
        strokeDashoffset: 0, duration: 1, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: svg.closest('.pain'), start: 'top 82%', once: true },
        onComplete: function () { gsap.set(strokes, { clearProps: 'strokeDasharray,strokeDashoffset' }); }
      });
    });

    /* The lime thread through the four "how it works" steps. */
    var thread = document.querySelector('[data-steps-thread]');
    if (thread) {
      gsap.to(thread, {
        scaleX: 1, duration: 1.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: thread.parentNode, start: 'top 78%', once: true }
      });
    }
  })();

  /* -------------------------------------------------------------------
     Hero load choreography
     One timeline, roughly a second — this is the whole first impression.
     ----------------------------------------------------------------- */
  if (animate) (function initHero() {
    var lines = document.querySelectorAll('[data-hero-lines] .line > span');
    var els   = document.querySelectorAll('[data-hero-el]');
    var fan   = document.querySelector('[data-hero-fan]');
    var zeb   = document.querySelector('[data-hero-zeb]');
    var inL   = document.querySelector('[data-hero-in="left"]');
    var inR   = document.querySelector('[data-hero-in="right"]');

    // Same percentage-transform caveat as the scroll reveals — hand GSAP
    // the offset in units it can cancel before tweening it away. The travel
    // is horizontal: every line starts off-stage past the left edge of the
    // page and slides in to where it belongs. Each line box is as wide as
    // the copy column, so -135% is off-screen for the short lines too.
    if (lines.length) gsap.set(lines, { y: 0, yPercent: 0, x: 0, xPercent: -135 });

    /* Hand-drawn accents draw themselves on, stroke by stroke, just after
       the line they belong to has landed. Each path is measured so the
       dash maths is right whatever the viewport does to it. */
    var strokes = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-scribble] path'), function (p) {
      var len = 200;
      try { len = Math.ceil(p.getTotalLength()) || 200; } catch (e) {}
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      strokes.push(p);
    });

    var tl = gsap.timeline({ delay: 0.12 });
    if (lines.length)   tl.to(lines, { xPercent: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out' }, 0);
    // The accents stay put and draw themselves on — they mark particular
    // letters, so they can only start once the line carrying those letters
    // has arrived. The per-stroke stagger stays small or the last mark is
    // still drawing itself well after the headline has landed.
    if (strokes.length) tl.to(strokes, {
      strokeDashoffset: 0, duration: 0.55, stagger: 0.05, ease: 'power2.inOut'
    }, 0.85);
    if (els.length)     tl.to(els,   { opacity: 1, x: 0, duration: 0.8, stagger: 0.07 }, 0.35);
    if (fan)            tl.to(fan,   { opacity: 1, x: 0, scale: 1, duration: 1.15 }, 0.2);
    if (zeb)            tl.to(zeb,   { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }, 0.75);

    /* The two back phones come in from their own side of the stage. They
       travel on xPercent, which leaves plain x free for the pointer
       parallax below — the two can then coexist on the same element.
       Opacity is a separate, front-loaded tween rather than part of the
       slide: the left phone crosses the headline on its way in, and it
       needs to still be mostly transparent while it does. */
    if (inL) {
      tl.fromTo(inL, { x: 0, xPercent: -170 }, { xPercent: 0, duration: 1.3, ease: 'power3.out' }, 0.3)
        .fromTo(inL, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.in' }, 0.3);
    }
    if (inR) {
      tl.fromTo(inR, { x: 0, xPercent: 170 }, { xPercent: 0, duration: 1.3, ease: 'power3.out' }, 0.42)
        .fromTo(inR, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.in' }, 0.42);
    }
  })();

  /* -------------------------------------------------------------------
     Scrub depth — [data-depth] layers drift against the scroll.
     Vertical only, because the pointer tilt below owns the horizontal
     axis; splitting them that way means the two never write the same
     property on the same element.
     ----------------------------------------------------------------- */
  if (animate) (function initDepth() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-depth]'), function (el) {
      var depth = parseFloat(el.getAttribute('data-depth')) || 0;
      if (!depth) return;
      gsap.fromTo(el,
        { y: depth * 0.5 },
        {
          y: depth * -0.5, ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom', end: 'bottom top', scrub: 1
          }
        }
      );
    });
  })();

  /* Pointer parallax on the hero phones — horizontal only. quickTo keeps
     this to a single interpolated write per element per frame. */
  if (animate && finePointer) (function initTilt() {
    var scope = document.querySelector('[data-tilt-scope]');
    if (!scope) return;
    var layers = Array.prototype.slice.call(scope.querySelectorAll('[data-tilt]'));
    if (!layers.length) return;

    var setters = layers.map(function (el) {
      return { set: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }),
               depth: parseFloat(el.getAttribute('data-tilt')) || 0 };
    });

    scope.addEventListener('pointermove', function (e) {
      var r = scope.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      setters.forEach(function (s) { s.set(nx * s.depth); });
    });
    scope.addEventListener('pointerleave', function () {
      setters.forEach(function (s) { s.set(0); });
    });
  })();

  /* -------------------------------------------------------------------
     Micro-interactions
     ----------------------------------------------------------------- */
  if (animate && finePointer) (function initMicro() {
    var clamp = gsap.utils.clamp(-6, 6);

    // Magnetic pull on the primary buttons, capped at 6px so it stays a
    // hint that the button noticed you rather than a button that runs away.
    Array.prototype.forEach.call(document.querySelectorAll('.btn--primary'), function (btn) {
      var qx = gsap.quickTo(btn, '--mx', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(btn, '--my', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        qx(clamp((e.clientX - r.left - r.width / 2) * 0.3));
        qy(clamp((e.clientY - r.top - r.height / 2) * 0.3));
      });
      btn.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });

    // Card tilt, 4° maximum. Enough to feel physical, not enough to notice.
    Array.prototype.forEach.call(document.querySelectorAll('.pain'), function (card) {
      var qry = gsap.quickTo(card, '--ry', { duration: 0.5, ease: 'power3.out' });
      var qrx = gsap.quickTo(card, '--rx', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        qry(((e.clientX - r.left) / r.width - 0.5) * 8);
        qrx(((e.clientY - r.top) / r.height - 0.5) * -8);
      });
      card.addEventListener('pointerleave', function () { qry(0); qrx(0); });
    });
  })();

  /* -------------------------------------------------------------------
     Horizontal rails (screenshot gallery, testimonials)

     Native scroll, scroll-snap and keyboard access are all left intact.
     Two desktop-only problems have to be solved on top of them:

     1. Lenis binds `wheel` on window with {passive:false} and calls
        preventDefault, so it swallows the gesture before the browser can
        do its usual "vertical wheel scrolls a horizontally-overflowing
        element" trick. We intercept wheel on the rail itself and
        stopPropagation so the event never reaches Lenis.

     2. The rails are full of <img>, and pressing on an image starts a
        native HTML5 image drag, which fires pointercancel and kills
        drag-to-scroll. Cancelling dragstart fixes it.
     ----------------------------------------------------------------- */
  (function initRails() {
    var rails = document.querySelectorAll('[data-drag-scroll], .gallery__track, .quotes');

    Array.prototype.forEach.call(rails, function (rail) {

      /* --- Wheel / trackpad ------------------------------------------ */
      rail.addEventListener('wheel', function (e) {
        if (e.ctrlKey) return;                       // pinch-zoom, leave alone

        // Trackpads send horizontal deltas directly; wheels send vertical.
        // Whichever axis dominates is what the person meant.
        var dx = e.deltaX, dy = e.deltaY;
        var delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        if (e.deltaMode === 1) delta *= 16;          // some mice report lines
        else if (e.deltaMode === 2) delta *= rail.clientWidth;
        if (!delta) return;

        var max = rail.scrollWidth - rail.clientWidth;
        if (max <= 0) return;

        // At either end, hand the gesture straight back to the page —
        // otherwise the rail becomes a scroll trap you can't get out of.
        if ((delta < 0 && rail.scrollLeft <= 0.5) ||
            (delta > 0 && rail.scrollLeft >= max - 0.5)) return;

        e.preventDefault();
        e.stopPropagation();                         // keep it away from Lenis
        freeScroll();                                // see below
        rail.scrollLeft += delta;
      }, { passive: false });

      /* Scroll snapping re-snaps after every programmatic scroll write, so
         a wheel gesture gets clamped to a single card and the rail feels
         stuck. Suspend snapping while the gesture is in flight and restore
         it once things come to rest, so it still lands cleanly. */
      var snapTimer = null;
      function freeScroll() {
        rail.classList.add('is-freescroll');
        clearTimeout(snapTimer);
        snapTimer = setTimeout(function () {
          rail.classList.remove('is-freescroll');
        }, 160);
      }

      /* --- Click-drag ------------------------------------------------- */
      var down = false, startX = 0, startLeft = 0, moved = 0;

      // Stop the screenshots inside from starting a native image drag.
      rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

      rail.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;       // native touch scroll is better
        if (e.button !== 0) return;
        down = true; moved = 0;
        startX = e.clientX; startLeft = rail.scrollLeft;
        // Capture so the drag survives the pointer leaving the rail.
        try { rail.setPointerCapture(e.pointerId); } catch (err) {}
      });

      rail.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        moved = Math.abs(dx);
        if (moved > 4) rail.classList.add('is-dragging');
        rail.scrollLeft = startLeft - dx;
      });

      function end(e) {
        if (!down) return;
        down = false;
        rail.classList.remove('is-dragging');
        if (e && e.pointerId != null) {
          try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      }
      rail.addEventListener('pointerup', end);
      rail.addEventListener('pointercancel', end);
      rail.addEventListener('lostpointercapture', end);

      // Swallow the click that ends a real drag, so releasing the mouse
      // over a card never reads as a tap on it.
      rail.addEventListener('click', function (e) {
        if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; }
      }, true);
    });
  })();

  /* -------------------------------------------------------------------
     Pricing: monthly / annual toggle
     ----------------------------------------------------------------- */
  var toggle = document.querySelector('[data-price-toggle]');
  if (toggle) {
    var buttons = Array.prototype.slice.call(toggle.querySelectorAll('button'));
    var pill = toggle.querySelector('[data-toggle-pill]');

    function movePill(btn, instant) {
      if (!pill || !hasGSAP) return;
      gsap.to(pill, {
        x: btn.offsetLeft - 5, width: btn.offsetWidth,
        duration: (instant || reduceMotion) ? 0 : 0.45, ease: 'expo.out'
      });
    }

    // Roll each digit block rather than swapping text — the movement is
    // what tells you the number changed.
    function setPrice(el, val) {
      if (!hasGSAP || reduceMotion) { el.textContent = val; return; }
      gsap.timeline()
        .to(el, { yPercent: -60, opacity: 0, duration: 0.16, ease: 'power2.in' })
        .add(function () { el.textContent = val; })
        .fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.28, ease: 'expo.out' });
    }

    var active = toggle.querySelector('button.is-active') || buttons[0];
    if (active) movePill(active, true);
    window.addEventListener('load', function () { if (active) movePill(active, true); });

    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var period = btn.getAttribute('data-period');
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      movePill(btn);
      document.querySelectorAll('[data-price]').forEach(function (p) {
        var val = p.getAttribute('data-' + period);
        if (val) setPrice(p, val);
      });
      document.querySelectorAll('[data-per]').forEach(function (per) {
        per.textContent = period === 'annual' ? '/mo, billed yearly' : '/mo';
      });
      window.track('pricing_toggle', { period: period });
    });
  }

  /* -------------------------------------------------------------------
     FAQ — animate the disclosure open and closed.
     <details> is kept as the real element (keyboard, find-in-page and
     no-JS all keep working); we just take over the height transition.
     ----------------------------------------------------------------- */
  if (animate) (function initFaq() {
    Array.prototype.forEach.call(document.querySelectorAll('.faq-item'), function (item) {
      var summary = item.querySelector('summary');
      var body = item.querySelector('.faq-item__body');
      if (!summary || !body) return;
      var busy = false;

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (busy) return;
        busy = true;

        if (item.open) {
          gsap.to(body, {
            height: 0, opacity: 0, duration: 0.32, ease: 'power2.inOut',
            onComplete: function () {
              item.open = false;
              gsap.set(body, { clearProps: 'height,opacity' });
              busy = false;
            }
          });
        } else {
          item.open = true;
          gsap.fromTo(body,
            { height: 0, opacity: 0 },
            {
              height: 'auto', opacity: 1, duration: 0.42, ease: 'expo.out',
              onComplete: function () {
                gsap.set(body, { clearProps: 'height,opacity' });
                busy = false;
                window.ScrollTrigger.refresh();
              }
            }
          );
        }
      });
    });
  })();

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

  /* =====================================================================
     Price intelligence map

     Where the numbers come from: assets/data/prices.json. Edit that file,
     then run `node tools/map/build-map.mjs` — it regenerates the coastline,
     the pins and the two marked blocks below. Everything between a
     `map:*:start` / `map:*:end` pair is generated; don't hand-edit it.

     Geography is build-time, prices are runtime. A pin's position comes out
     of the same Mercator projection the coastline does, so it cannot drift
     off its province — but that means a *new* city needs the script re-run,
     not just a JSON edit. Numbers for cities that already have pins are
     picked up live from the JSON on load.

     IMPORTANT: while `source` is "sample" these figures are illustrative,
     and the page says so in plain sight under the map. It must keep saying
     so until they come from the real pricing backend.
     ===================================================================== */
  (function initPriceMap() {
    var section = document.getElementById('prices');
    if (!section) return;

    /* The projection, shared with tools/map/build-map.mjs. */
    /* map:proj:start */
    var MAP_PROJ = { scale: 2463.4958, offX: -4936.34, offY: 958.4 };
    function project(lat, lng) {
      var x = lng * Math.PI / 180 * MAP_PROJ.scale + MAP_PROJ.offX;
      var y = -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * MAP_PROJ.scale + MAP_PROJ.offY;
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    }
    /* map:proj:end */

    /* An inline copy of assets/data/prices.json, so the section still works
       from a file:// open (fetch is blocked there) and if the request fails. */
    /* map:fallback:start */
    var FALLBACK = {
      source: 'sample', seed: 'manila',
      order: ['manila', 'baguio', 'pangasinan', 'tarlac', 'zambales', 'vigan', 'tuguegarao', 'naga'],
      cities: {
        manila: { name: 'Metro Manila', lat: 14.5995, lng: 120.9842, hub: true, rice: 48, eggs: 9, chicken: 195, updated: 12, conf: 94, n: 1240 },
        baguio: { name: 'Baguio', lat: 16.4023, lng: 120.596, rice: 52, eggs: 8, chicken: 205, updated: 6, conf: 87, n: 410 },
        pangasinan: { name: 'Pangasinan', lat: 16.0219, lng: 120.2317, rice: 43, eggs: 8, chicken: 181, updated: 38, conf: 71, n: 168 },
        vigan: { name: 'Vigan', lat: 17.5747, lng: 120.3869, rice: 47, eggs: 8, chicken: 190, updated: 52, conf: 64, n: 96 },
        tuguegarao: { name: 'Tuguegarao', lat: 17.6132, lng: 121.727, rice: 42, eggs: 7, chicken: 179, updated: 63, conf: 61, n: 84 },
        tarlac: { name: 'Tarlac', lat: 15.4802, lng: 120.5979, rice: 44, eggs: 8, chicken: 186, updated: 27, conf: 74, n: 205 },
        zambales: { name: 'Zambales', lat: 15.3276, lng: 119.9787, rice: 46, eggs: 9, chicken: 192, updated: 44, conf: 66, n: 112 },
        naga: { name: 'Naga', lat: 13.6218, lng: 123.1948, rice: 46, eggs: 8, chicken: 188, updated: 24, conf: 78, n: 210 }
      }
    };
    /* map:fallback:end */

    var ORDER = FALLBACK.order.slice();
    var CITIES = {};
    ORDER.forEach(function (key) {
      var c = FALLBACK.cities[key];
      if (!c) return;
      var p = project(c.lat, c.lng);
      CITIES[key] = { name: c.name, rice: c.rice, eggs: c.eggs, chicken: c.chicken,
                      updated: c.updated, conf: c.conf, n: c.n, x: p.x, y: p.y };
    });

    var pins    = Array.prototype.slice.call(section.querySelectorAll('.pin'));
    var ripple  = section.querySelector('[data-ripple]');
    var glow    = section.querySelector('.map-glow');
    var wipe    = section.querySelector('[data-luzon-wipe]');
    var links   = Array.prototype.slice.call(section.querySelectorAll('.map-link'));
    var fill    = section.querySelector('[data-conf-fill]');
    var place   = section.querySelector('[data-conf-place]');
    var pctEl   = section.querySelector('[data-conf-pct]');
    var nEl     = section.querySelector('[data-conf-n]');
    var confRegion = section.querySelector('[data-conf-region]');

    var out = {};
    ['rice', 'eggs', 'chicken', 'updated'].forEach(function (k) {
      out[k] = section.querySelector('[data-price="' + k + '"]');
    });

    var currentKey = null;

    function fmt(n) { return n.toLocaleString('en-US'); }

    /* Numbers count rather than snap — a value that travels reads as a
       measurement updating, where a value that jumps reads as a page swap. */
    function countTo(el, to, format) {
      if (!el) return;
      var from = parseFloat(String(el.textContent).replace(/[^0-9.]/g, '')) || 0;
      if (!animate) { el.textContent = format ? format(to) : to; return; }
      var proxy = { v: from };
      gsap.to(proxy, {
        v: to, duration: 0.7, ease: 'power2.out',
        onUpdate: function () {
          var v = Math.round(proxy.v);
          el.textContent = format ? format(v) : v;
        }
      });
    }

    function setCity(key, opts) {
      var c = CITIES[key];
      if (!c || key === currentKey) return;
      currentKey = key;

      pins.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-pin') === key);
      });

      countTo(out.rice, c.rice);
      countTo(out.eggs, c.eggs);
      countTo(out.chicken, c.chicken);
      countTo(out.updated, c.updated);
      countTo(pctEl, c.conf);
      countTo(nEl, c.n, fmt);
      if (place) place.textContent = c.name;

      if (fill) {
        if (animate) gsap.to(fill, { scaleX: c.conf / 100, duration: 0.9, ease: 'expo.out' });
        else fill.style.transform = 'scaleX(' + (c.conf / 100) + ')';
      }

      // The ripple: brightness sweeping outward from the pin through the
      // dot field. One expanding mask circle, not several hundred dots.
      // Kept to a local radius — a wash that engulfs the whole archipelago
      // reads as "the page changed colour", not "a price landed here".
      if (animate && ripple && glow && !(opts && opts.silent)) {
        gsap.timeline()
          .set(ripple, { attr: { cx: c.x, cy: c.y, r: 0 } })
          .set(glow, { opacity: 0.9 })
          .to(ripple, { attr: { r: 260 }, duration: 1.25, ease: 'power2.out' }, 0)
          .to(glow, { opacity: 0, duration: 0.85, ease: 'power1.in' }, 0.4);
      }
    }

    /* --- Interaction ------------------------------------------------- */
    var userEngaged = false;
    var idleTimer = null;

    function engage(key) {
      userEngaged = true;
      // Announce only what the visitor asked for. The idle cycle stays
      // silent; being told a new city every 4.5 seconds is not helpful.
      if (confRegion) confRegion.setAttribute('aria-live', 'polite');
      setCity(key);
      window.track('price_pin', { city: key });
      // Hand control back to the cycle once they've stopped poking at it.
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        userEngaged = false;
        if (confRegion) confRegion.setAttribute('aria-live', 'off');
      }, 12000);
    }

    pins.forEach(function (pin) {
      var key = pin.getAttribute('data-pin');
      pin.addEventListener('click', function () { engage(key); });
      pin.addEventListener('pointerenter', function () {
        if (finePointer) engage(key);
      });
      pin.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); engage(key); }
      });
    });

    /* --- Auto-cycle --------------------------------------------------
       Suspended whenever the section is off-screen or the tab is hidden.
       A timer ticking behind a section nobody is looking at is a battery
       cost and a source of jank with nothing to show for it. --------- */
    var i = 0, timer = null, onScreen = false;

    function tick() {
      if (!userEngaged) {
        i = (i + 1) % ORDER.length;
        setCity(ORDER[i]);
      }
    }
    function startCycle() {
      if (timer || !animate) return;
      timer = setInterval(tick, 4500);
    }
    function stopCycle() {
      clearInterval(timer);
      timer = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopCycle();
      else if (onScreen) startCycle();
    });

    // Seed the panel without firing a ripple on a section nobody has seen.
    var SEED = CITIES[FALLBACK.seed] ? FALLBACK.seed : ORDER[0];
    setCity(SEED, { silent: true });
    if (fill) fill.style.transform = 'scaleX(' + (CITIES[SEED].conf / 100) + ')';

    /* --- Live numbers -------------------------------------------------
       The inline table above is a fallback; assets/data/prices.json is the
       source of truth. Point `fetch` at your own endpoint instead and the
       rest of this section needs no changes — same shape, same keys.

       Only figures are taken from the response. Pins, routes and the
       coastline are generated markup, so a city that has no pin in the DOM
       is skipped: it needs `node tools/map/build-map.mjs` and a redeploy,
       not a live patch. And the "sample data" line only comes off when the
       payload says the numbers are real. ------------------------------ */
    function hydrate(data) {
      if (!data || !data.cities) return;
      var changed = false;

      Object.keys(data.cities).forEach(function (key) {
        var incoming = data.cities[key];
        var current = CITIES[key];
        if (!current) {
          if (window.console) {
            console.warn('[prices] "' + key + '" has no pin on the map — ' +
                         'run: node tools/map/build-map.mjs');
          }
          return;
        }
        ['name', 'rice', 'eggs', 'chicken', 'updated', 'conf', 'n'].forEach(function (f) {
          if (incoming[f] !== undefined && incoming[f] !== current[f]) {
            current[f] = incoming[f];
            changed = true;
          }
        });
      });

      // Real prices, real label. Anything short of an explicit "live" keeps
      // the illustrative note — see the honesty note in README.md.
      var note = section.querySelector('[data-prices-note]');
      if (note) note.setAttribute('data-state', data.source === 'live' ? 'live' : 'sample');

      // Repaint whatever is on screen right now with the new numbers.
      if (changed) {
        var showing = currentKey;
        currentKey = null;
        setCity(showing, { silent: true });
      }
    }

    if (window.fetch) {
      fetch('assets/data/prices.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(hydrate)
        .catch(function () { /* fallback table is already on screen */ });
    }

    /* --- Entrance ---------------------------------------------------- */
    if (animate) {
      // Luzon lights north to south. Highlighting where coverage is
      // densest first is the honest version of "we start with Luzon".
      if (wipe) gsap.set(wipe, { attr: { height: 0 } });
      links.forEach(function (l) {
        var len = 0;
        try { len = l.getTotalLength(); } catch (e) {}
        if (len) gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(pins, { opacity: 0 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 65%', once: true }
      });
      if (wipe) tl.to(wipe, { attr: { height: 800 }, duration: 1.3, ease: 'power2.inOut' }, 0);
      if (links.length) tl.to(links, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power2.out' }, 0.4);
      /* Scale the marks, never the <g>.
         A group scaled about an svgOrigin keeps a residual translate the size
         of its own bounding box — and the box includes the pin's label, so a
         wide name ("Pangasinan") shifted its pin ~75 units west, into the
         South China Sea. The dot, ring and shadow each carry
         `transform-box: fill-box`, so they scale about themselves and the
         label's width stops mattering. clearProps hands the element back to
         the stylesheet afterwards, which is what drives the active pulse. */
      pins.forEach(function (pin, idx) {
        var marks = pin.querySelectorAll('.pin__dot, .pin__ring, .pin__shadow');
        var at = 0.7 + idx * 0.09;
        tl.fromTo(pin, { opacity: 0 }, { opacity: 1, duration: 0.35 }, at);
        tl.fromTo(marks,
          { scale: 0 },
          { scale: 1, duration: 0.6, ease: 'back.out(2.2)', clearProps: 'transform' },
          at);
      });
      // The seed call above already set the first city, so clear the guard
      // to let the first ripple actually fire as the section arrives.
      tl.add(function () { currentKey = null; setCity(SEED); }, 1.5);

      // Price cards drift up out of depth.
      var cards = section.querySelectorAll('[data-price-card]');
      gsap.set(cards, { filter: 'blur(8px)' });
      gsap.to(cards, {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', stagger: 0.1, duration: 0.9,
        scrollTrigger: { trigger: section, start: 'top 60%', once: true }
      });

      window.ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: function (self) {
          onScreen = self.isActive;
          if (self.isActive && !document.hidden) startCycle();
          else stopCycle();
        }
      });
    }
  })();

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

    try { dismissed = window.sessionStorage.getItem('zeb-dismissed') === '1'; } catch (e) {}
    guide.hidden = false;
    if (dismissed) guide.classList.add('is-collapsed');
    window.setTimeout(function () { guide.classList.add('is-in'); }, 600);

    function setText(msg) {
      if (!textEl || msg === currentTip) return;
      currentTip = msg;
      if (!animate) { textEl.textContent = msg; return; }
      gsap.timeline()
        .to(textEl, { opacity: 0, y: 5, duration: 0.18, ease: 'power2.in' })
        .add(function () { textEl.textContent = msg; })
        .fromTo(textEl, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.26, ease: 'expo.out' });
    }

    function markEngaged() { guide.classList.add('has-engaged'); }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        markEngaged();
        var nowCollapsed = guide.classList.toggle('is-collapsed');
        try { window.sessionStorage.setItem('zeb-dismissed', nowCollapsed ? '1' : '0'); } catch (e) {}
        window.track('zeb_toggle', { open: !nowCollapsed });
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        markEngaged();
        guide.classList.add('is-collapsed');
        try { window.sessionStorage.setItem('zeb-dismissed', '1'); } catch (e2) {}
        window.track('zeb_dismiss', {});
      });
    }

    if (tipEls.length && 'IntersectionObserver' in window) {
      var visible = {};
      var zio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = tipEls.indexOf(entry.target);
          if (entry.isIntersecting) visible[id] = entry.intersectionRatio;
          else delete visible[id];
        });
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

  /* -------------------------------------------------------------------
     Late layout settles: webfonts swapping in and content-visibility
     sections rendering for the first time both change section heights,
     which invalidates every ScrollTrigger start/end computed before them.
     ----------------------------------------------------------------- */
  if (animate) {
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
    }
  }
})();
