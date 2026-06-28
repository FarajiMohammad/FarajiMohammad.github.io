/* main.js – Mohammad Faraji personal site */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     DARK-MODE
  ══════════════════════════════════════════ */
  function toggleDark() {
    const isDark = document.body.classList.toggle('dark');
    const btn = document.getElementById('dm-toggle');
    if (btn) {
      btn.innerHTML = isDark
        ? '<span aria-hidden="true">☀️</span> Light'
        : '<span aria-hidden="true">🌙</span> Dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    try { localStorage.setItem('darkMode', isDark ? '1' : '0'); } catch (e) {}
  }

  /* Restore saved preference on load */
  try {
    if (localStorage.getItem('darkMode') === '1') {
      document.body.classList.add('dark');
    }
  } catch (e) {}

  /* Update toggle button label once DOM is ready */
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('dm-toggle');
    if (btn && document.body.classList.contains('dark')) {
      btn.innerHTML = '<span aria-hidden="true">☀️</span> Light';
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
  });

  /* ══════════════════════════════════════════
     ML-THEMED TRANSITION OVERLAY
     — a canvas that fires between pages,
       drawing a brief "signal propagation"
       (left-to-right colour sweep + falling
       binary / matrix chars reminiscent of
       backprop data-streams).
  ══════════════════════════════════════════ */

  var _transitioning = false;

  /** Build (or reuse) the full-screen overlay canvas */
  function getOverlay() {
    var el = document.getElementById('page-transition-overlay');
    if (!el) {
      el = document.createElement('canvas');
      el.id = 'page-transition-overlay';
      Object.assign(el.style, {
        position:    'fixed',
        top:         '0',
        left:        '0',
        width:       '100%',
        height:      '100%',
        zIndex:      '9999',
        pointerEvents: 'none',
        opacity:     '0'
      });
      document.body.appendChild(el);
    }
    el.width  = window.innerWidth;
    el.height = window.innerHeight;
    return el;
  }

  /**
   * Run a ~450 ms ML-themed sweep, then call `done()`.
   *
   * Visual idea:
   *   Phase 1 (0–40 %): A thin cyan/amber "activation wave" sweeps
   *                      left-to-right across the full screen, with
   *                      small glowing nodes popping along it (like
   *                      a forward-pass through a layer).
   *   Phase 2 (40–100%): The wave passes, the screen fades back to
   *                       transparent, revealing the new page.
   */
  function runTransition(done) {
    var canvas = getOverlay();
    var ctx    = canvas.getContext('2d');
    var W      = canvas.width;
    var H      = canvas.height;
    var isDark = document.body.classList.contains('dark');

    /* accent colours */
    var CYAN  = isDark ? [41,  196, 192] : [41,  196, 192];
    var AMBER = isDark ? [245, 166,  35] : [245, 166,  35];

    /* ML chars that streak past */
    var CHARS = ['0','1','∇','λ','σ','W','⊕','b','∑','ε','α','β','η','μ'];

    /* random "neuron" sparks along the wave front */
    var SPARKS = 22;
    var sparks = [];
    for (var s = 0; s < SPARKS; s++) {
      sparks.push({
        yRatio: Math.random(),   /* 0–1 of screen height */
        delay:  Math.random() * 0.18,
        size:   2 + Math.random() * 4,
        col:    Math.random() > 0.5 ? CYAN : AMBER
      });
    }

    /* falling char columns */
    var COL_COUNT = Math.floor(W / 22);
    var cols = [];
    for (var c = 0; c < COL_COUNT; c++) {
      cols.push({
        char:  CHARS[Math.floor(Math.random() * CHARS.length)],
        yFrac: Math.random(),
        speed: 0.3 + Math.random() * 0.4,
        alpha: 0.08 + Math.random() * 0.15,
        col:   Math.random() > 0.5 ? CYAN : AMBER
      });
    }

    var DURATION = 480; /* ms */
    var start    = null;
    var raf;

    canvas.style.opacity = '1';

    function frame(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / DURATION, 1); /* 0 → 1 */

      ctx.clearRect(0, 0, W, H);

      /* ── base semi-transparent veil (peaks at mid-transition) ── */
      var veilAlpha = progress < 0.5
        ? progress * 2 * 0.18          /* 0 → 0.18 */
        : (1 - progress) * 2 * 0.18;  /* 0.18 → 0 */
      ctx.fillStyle = isDark
        ? 'rgba(18,18,18,' + veilAlpha + ')'
        : 'rgba(242,242,242,' + veilAlpha + ')';
      ctx.fillRect(0, 0, W, H);

      /* ── wave X position ── */
      var waveX = progress * (W + 120) - 60; /* sweeps left to right */

      /* ── gradient beam (the "activation layer signal") ── */
      var beamW = 180;
      var grd = ctx.createLinearGradient(waveX - beamW, 0, waveX + beamW, 0);
      var peakA = progress < 0.5
        ? progress * 2
        : (1 - progress) * 2;
      grd.addColorStop(0,    'rgba(' + CYAN.join(',')  + ',0)');
      grd.addColorStop(0.35, 'rgba(' + AMBER.join(',') + ',' + (peakA * 0.12) + ')');
      grd.addColorStop(0.5,  'rgba(' + CYAN.join(',')  + ',' + (peakA * 0.25) + ')');
      grd.addColorStop(0.65, 'rgba(' + AMBER.join(',') + ',' + (peakA * 0.12) + ')');
      grd.addColorStop(1,    'rgba(' + CYAN.join(',')  + ',0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      /* ── thin leading edge line ── */
      ctx.beginPath();
      ctx.moveTo(waveX, 0);
      ctx.lineTo(waveX, H);
      ctx.strokeStyle = 'rgba(' + CYAN.join(',') + ',' + (peakA * 0.6) + ')';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      /* ── neuron sparks along the wave front ── */
      sparks.forEach(function (sp) {
        var localP = Math.max(0, (progress - sp.delay) / (1 - sp.delay));
        if (localP <= 0 || localP >= 1) return;
        var sx = waveX + (Math.sin(localP * Math.PI * 3 + sp.yRatio) * 18);
        var sy = sp.yRatio * H;
        var spA = Math.sin(localP * Math.PI) * peakA;

        /* glow halo */
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + sp.col.join(',') + ',' + (spA * 0.15) + ')';
        ctx.fill();

        /* core dot */
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + sp.col.join(',') + ',' + (spA * 0.8) + ')';
        ctx.fill();
      });

      /* ── falling ML chars ── */
      ctx.save();
      ctx.font = '13px "Space Grotesk", monospace';
      cols.forEach(function (col, ci) {
        var cx  = ci * 22 + 11;
        /* only visible near the wave */
        var dist = Math.abs(cx - waveX);
        if (dist > 200) return;
        var distA = Math.max(0, 1 - dist / 200);
        var cy = ((col.yFrac + progress * col.speed) % 1) * H;
        ctx.fillStyle = 'rgba(' + col.col.join(',') + ',' + (col.alpha * distA * peakA * 4) + ')';
        ctx.fillText(col.char, cx, cy);
      });
      ctx.restore();

      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        canvas.style.opacity = '0';
        done();
      }
    }

    raf = requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════
     PAGE NAVIGATION  (with ML transition)
  ══════════════════════════════════════════ */
  function showPage(name) {
    /* Find the currently active page */
    var currentPage = document.querySelector('.page.active');
    var targetPage  = document.getElementById('page-' + name);
    if (!targetPage || (currentPage && currentPage.id === 'page-' + name)) return;
    if (_transitioning) return;

    /* Update nav buttons immediately */
    document.querySelectorAll('.nav-links button').forEach(function (b) {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });
    var btn = document.getElementById('btn-' + name);
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }

    /* Update document title */
    var titles = {
      home:    'Mohammad Faraji — ML Researcher',
      resume:  'Résumé — Mohammad Faraji',
      contact: 'Contact — Mohammad Faraji'
    };
    document.title = titles[name] || titles.home;

    _transitioning = true;

    /* Phase 1: Animate OUT the current page */
    if (currentPage) {
      currentPage.classList.add('page-exit');
    }

    /* Fire the ML sweep overlay */
    runTransition(function () {

      /* Hide old page */
      if (currentPage) {
        currentPage.classList.remove('active', 'page-exit');
        currentPage.setAttribute('aria-hidden', 'true');
      }

      /* Show new page */
      targetPage.removeAttribute('aria-hidden');
      targetPage.classList.add('active', 'page-enter');

      /* Trigger enter animation on next frame */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          targetPage.classList.remove('page-enter');
          _transitioning = false;
        });
      });

      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  /* ══════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════ */
  function submitForm() {
    var name    = document.getElementById('f-name').value.trim();
    var email   = document.getElementById('f-email').value.trim();
    var subject = document.getElementById('f-subject').value.trim();
    var message = document.getElementById('f-message').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in your name, email, and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    var mailto =
      'mailto:mohammad.faraji@uok.ac.ir' +
      '?subject=' + encodeURIComponent(subject || 'Website inquiry from ' + name) +
      '&body='    + encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message);

    window.location.href = mailto;

    var successEl = document.getElementById('form-success');
    if (successEl) { successEl.style.display = 'block'; }
  }

  /* ── Expose to global scope ── */
  window.toggleDark = toggleDark;
  window.showPage   = showPage;
  window.submitForm = submitForm;

  /* ── Set initial aria states on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.page').forEach(function (p) {
      if (!p.classList.contains('active')) {
        p.setAttribute('aria-hidden', 'true');
      }
    });
    var activeBtn = document.querySelector('.nav-links button.active');
    if (activeBtn) { activeBtn.setAttribute('aria-current', 'page'); }
  });

}());
