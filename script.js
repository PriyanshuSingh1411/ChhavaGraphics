/* ==========================================================================
   CHHAVA GRAPHICS — main script
   Vanilla JS, no dependencies. Each block is defensive: if an element
   isn't found, that block simply skips itself instead of throwing.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 1. Service data — single source of truth for the services grid      */
  /*    Only name + image are shown on the card; click opens a lightbox. */
  /* ------------------------------------------------------------------ */
  var SERVICES = [
    { name: 'Flex & Banner Printing', img: 'flex-banner.png' },
    { name: 'Vinyl Printing (Eco Solvent)', img: 'vinyl.jpg' },
    { name: 'Sunboard Printing', img: 'sunboard.png' },
    { name: 'Visiting Cards', img: 'visiting-cards.jpg' },
    { name: 'Bill Book & Letterhead', img: 'billbook.jpg' },
    { name: 'Pamphlets & Flyers', img: 'pamphlets.jpg' },
    { name: 'Stickers & Labels', img: 'stickers.jpg' },
    { name: 'One Way Vision', img: 'one-way-vision.jpg' },
    { name: 'ID Cards', img: 'id-cards.jpg' },
    { name: 'Acrylic Name Plate & Logo', img: 'acrylic-plate.jpg' },
    { name: 'LED Sign Board & Glow Sign', img: 'led-sign.jpg' },
    { name: 'Neon Sign Board', img: 'neon-sign.jpg' },
    { name: 'Merchandise', img: 'merchandise.png' },
    { name: 'Photo Frame Printing', img: 'photo-frame.jpg' },
    { name: 'Event Banner Design', img: 'event-banner.png' },
    { name: 'Social Media Post Design', img: 'social-post.jpg' },
    { name: 'Logo Design & Branding', img: 'branding-logo.jpg' }
  ];

  function buildServiceCards() {
    var grid = document.getElementById('servicesGrid');
    if (!grid) return;
    var frag = document.createDocumentFragment();

    SERVICES.forEach(function (svc, i) {
      var card = document.createElement('div');
      card.className = 'service-card reveal-up';
      card.style.setProperty('--stagger', (i % 6));

      var src = 'images/services/' + svc.img;
      card.innerHTML =
        '<button type="button" class="service-thumb" aria-label="View ' + svc.name + ' full size">' +
  '<img src="' + src + '" alt="' + svc.name + '" loading="eager" decoding="async" fetchpriority="high">' +
'</button>' +
        '<h3>' + svc.name + '</h3>';
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    observeReveals(grid.querySelectorAll('.reveal-up'));
    initLightboxTriggers(grid);
  }

  /* ------------------------------------------------------------------ */
  /* 1b. Lightbox — click any service thumbnail to view it full size     */
  /* ------------------------------------------------------------------ */
  var lightboxEl, lightboxImg, lightboxCaption, lastFocusedEl;

  function buildLightbox() {
    if (lightboxEl) return;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-hidden', 'true');
    lightboxEl.innerHTML =
      '<div class="lightbox-backdrop" data-lightbox-close></div>' +
      '<div class="lightbox-inner">' +
        '<button type="button" class="lightbox-close" aria-label="Close" data-lightbox-close>' +
          '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
        '<img class="lightbox-img" src="" alt="">' +
        '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(lightboxEl);

    lightboxImg = lightboxEl.querySelector('.lightbox-img');
    lightboxCaption = lightboxEl.querySelector('.lightbox-caption');

    lightboxEl.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightboxEl.classList.contains('is-open')) closeLightbox();
    });
  }

  function openLightbox(src, alt) {
    buildLightbox();
    lastFocusedEl = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightboxCaption.textContent = alt || '';
    lightboxEl.classList.add('is-open');
    lightboxEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxEl.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    lightboxEl.setAttribute('aria-hidden', 'true');
    document.body.style.removeProperty('overflow');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  function initLightboxTriggers(scope) {
    scope.querySelectorAll('.service-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        if (!img) return;
        openLightbox(img.src, img.alt);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Preloader                                                        */
  /* ------------------------------------------------------------------ */
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var hide = function () {
      pre.classList.add('is-hidden');
      document.body.style.removeProperty('overflow');
    };
    var minTimer = setTimeout(hide, 900);
    window.addEventListener('load', function () {
      clearTimeout(minTimer);
      setTimeout(hide, 250);
    });
    setTimeout(hide, 3500);
  }

  /* ------------------------------------------------------------------ */
  /* 3. Header: scroll shadow + hide-on-scroll-down                      */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);

      if (y > lastY && y > 220) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();
  }

  /* ------------------------------------------------------------------ */
  /* 4. Mobile nav drawer                                                */
  /* ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var drawer = document.getElementById('mobileNav');
    var backdrop = document.getElementById('mobileNavBackdrop');
    if (!toggle || !drawer || !backdrop) return;

    function open() {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.removeProperty('overflow');
    }
    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.contains('is-open');
      isOpen ? close() : open();
    });
    backdrop.addEventListener('click', close);
    drawer.querySelectorAll('.mobile-link, .mobile-call').forEach(function (link) {
      link.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Smooth-scroll for in-page anchors (accounts for fixed header)    */
  /* ------------------------------------------------------------------ */
  function initAnchorScroll() {
    var header = document.getElementById('siteHeader');
    var offset = header ? header.offsetHeight + 14 : 90;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Scroll-reveal via IntersectionObserver                           */
  /* ------------------------------------------------------------------ */
  var revealObserver;
  function observeReveals(nodeList) {
    if (prefersReducedMotion) {
      nodeList.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    }
    nodeList.forEach(function (el) { revealObserver.observe(el); });
  }

  function initReveals() {
    document.querySelectorAll('.services-grid, .gallery-grid, .why-list, .process-steps, .testi-track, .contact-methods').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.classList.contains('reveal-up') && !child.style.getPropertyValue('--stagger')) {
          child.style.setProperty('--stagger', i % 6);
        }
      });
    });
    observeReveals(document.querySelectorAll('.reveal-up, .reveal-scale'));
  }

  /* ------------------------------------------------------------------ */
  /* 7. Animated stat counters                                           */
  /* ------------------------------------------------------------------ */
  function initCounters() {
    var counters = document.querySelectorAll('.stat-num[data-count]');
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (prefersReducedMotion) { el.textContent = target; return; }

      var start = 0;
      var duration = 1400;
      var startTime = null;

      function step(ts) {
        if (startTime === null) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 8. Process rail fill-on-scroll                                      */
  /* ------------------------------------------------------------------ */
  function initProcessFill() {
    var fill = document.getElementById('processFill');
    var rail = document.querySelector('.process-rail');
    if (!fill || !rail) return;

    function update() {
      var rect = rail.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.85;
      var end = vh * 0.35;
      var progress = (start - rect.top) / (start - end + rect.height * 0.5);
      progress = Math.max(0, Math.min(1, progress));
      fill.style.width = (progress * 100) + '%';
    }
    window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------ */
  /* 9. Custom seal cursor (fine pointer only)                            */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cursor = document.getElementById('sealCursor');
    if (!cursor) return;

    var x = 0, y = 0, cx = 0, cy = 0;
    var active = false;

    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!active) { active = true; cursor.classList.add('is-active'); }
    });
    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-active');
    });

    document.querySelectorAll('a, button, .service-card, input, select, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });

    function raf() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ------------------------------------------------------------------ */
  /* 10. Back-to-top button                                              */
  /* ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 11. Testimonials — drag-to-scroll on desktop (touch already works)  */
  /* ------------------------------------------------------------------ */
  function initTestiDrag() {
    var track = document.getElementById('testiTrack');
    var wrap = track ? track.closest('.testi-track-wrap') : null;
    if (!wrap) return;

    var isDown = false, startX, scrollLeft;

    wrap.addEventListener('mousedown', function (e) {
      isDown = true;
      wrap.style.cursor = 'grabbing';
      startX = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(function (evt) {
      wrap.addEventListener(evt, function () {
        isDown = false;
        wrap.style.removeProperty('cursor');
      });
    });
    wrap.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - wrap.offsetLeft;
      var walk = (x - startX) * 1.4;
      wrap.scrollLeft = scrollLeft - walk;
    });
  }

  /* ------------------------------------------------------------------ */
  /* 12. Contact form — client-side validation + friendly success state  */
  /* ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var successEl = document.getElementById('formSuccess');
    var submitBtn = form.querySelector('.form-submit');

    var validators = {
      fName: function (val) { return val.trim().length >= 2; },
      fPhone: function (val) { return /^[0-9+\-\s()]{7,15}$/.test(val.trim()); },
      fService: function (val) { return val.trim().length > 0; }
    };

    function setError(id, hasError) {
      var field = document.getElementById(id);
      if (!field) return;
      var wrapper = field.closest('.form-field');
      if (wrapper) wrapper.classList.toggle('has-error', hasError);
    }

    function validateField(id) {
      var field = document.getElementById(id);
      if (!field || !validators[id]) return true;
      var ok = validators[id](field.value);
      setError(id, !ok);
      return ok;
    }

    Object.keys(validators).forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('blur', function () { validateField(id); });
      field.addEventListener('input', function () {
        var wrapper = field.closest('.form-field');
        if (wrapper && wrapper.classList.contains('has-error')) validateField(id);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = Object.keys(validators).map(validateField).every(Boolean);
      if (!allValid) {
        var firstError = form.querySelector('.form-field.has-error input, .form-field.has-error select');
        if (firstError) firstError.focus();
        return;
      }

      if (submitBtn) submitBtn.classList.add('is-loading');
      successEl && successEl.classList.remove('is-visible');

      setTimeout(function () {
        if (submitBtn) submitBtn.classList.remove('is-loading');
        if (successEl) successEl.classList.add('is-visible');
        form.reset();
      }, 900);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 13. Footer year                                                     */
  /* ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    buildServiceCards();
    initPreloader();
    initHeader();
    initMobileNav();
    initAnchorScroll();
    initReveals();
    initCounters();
    initProcessFill();
    initCursor();
    initBackToTop();
    initTestiDrag();
    initContactForm();
    initFooterYear();
  });
})();