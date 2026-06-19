/* main.js – Mohammad Faraji personal site */

(function () {
  'use strict';

  /* ── Dark-mode ── */
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

  /* ── Page navigation ── */
  function showPage(name) {
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.nav-links button').forEach(function (b) {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });

    var page = document.getElementById('page-' + name);
    var btn  = document.getElementById('btn-'  + name);

    if (page) {
      page.classList.add('active');
      page.removeAttribute('aria-hidden');
    }
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }

    /* Update document title for better browser-history UX */
    var titles = {
      home:    'Mohammad Faraji — ML Researcher',
      resume:  'Résumé — Mohammad Faraji',
      contact: 'Contact — Mohammad Faraji'
    };
    document.title = titles[name] || titles.home;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Contact form ── */
  function submitForm() {
    var name    = document.getElementById('f-name').value.trim();
    var email   = document.getElementById('f-email').value.trim();
    var subject = document.getElementById('f-subject').value.trim();
    var message = document.getElementById('f-message').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in your name, email, and message.');
      return;
    }

    /* Basic email format check */
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

  /* ── Expose to global scope (called from inline onclick) ── */
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
