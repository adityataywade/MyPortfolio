/* =====================================================================
   ADITYA TAYWADE — PORTFOLIO SCRIPTS
   Handles: nav scroll state + active link, mobile menu, smooth scroll,
   scroll-reveal animations, project accordions, contact form submit.
===================================================================== */
(function () {
  'use strict';

  /* ===========================
     NAV SCROLL + ACTIVE LINK
  =========================== */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);

    const pos = window.scrollY + 140;
    sections.forEach((sec) => {
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (!link) return;
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===========================
     MOBILE NAV
  =========================== */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    const mobileLinks = mobileNav.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', open);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===========================
     SMOOTH SCROLL (in-page anchors)
  =========================== */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' });
      }
    });
  });

  /* ===========================
     SCROLL-REVEAL (fade-up / fade-in)
  =========================== */
  const fadeEls = document.querySelectorAll('.fade-up, .fade-in');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    fadeEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: no IntersectionObserver support, just show content.
    fadeEls.forEach((el) => el.classList.add('visible'));
  }

  /* ===========================
     PROJECT ACCORDIONS
  =========================== */
  const projectHeaders = document.querySelectorAll('.project-header');
  projectHeaders.forEach((header) => {
    const toggle = () => {
      const item = header.closest('.project-item');
      const isOpen = item.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen);
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ===========================
     CONTACT FORM — EmailJS Integration
  =========================== */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  // Dynamically load EmailJS SDK and initialize it (with CDN fallback)
  const EMAILJS_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
    'https://unpkg.com/@emailjs/browser@4/dist/email.min.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  async function loadEmailJSSDK() {
    if (window.emailjs) return window.emailjs;

    let lastError;
    for (const url of EMAILJS_CDN_URLS) {
      try {
        await loadScript(url);
        if (window.emailjs) return window.emailjs;
      } catch (err) {
        lastError = err;
        console.warn(`EmailJS SDK load failed from ${url}, trying next source...`);
      }
    }
    throw lastError || new Error('Failed to load EmailJS SDK from all sources');
  }

  // EmailJS configuration
  const EMAILJS_PUBLIC_KEY = 'XnE2si_VwXvWvI-Pj';
  const EMAILJS_SERVICE_ID = 'service_siujq2o';
  const EMAILJS_TEMPLATE_ID = 'template_mrd3rx3';

  let emailjsReady = false;
  loadEmailJSSDK()
    .then(() => {
      if (window.emailjs) {
        try {
          emailjs.init(EMAILJS_PUBLIC_KEY);
          emailjsReady = true;
        } catch (e) {
          console.error('EmailJS init error:', e);
        }
      }
    })
    .catch((err) => {
      console.error('EmailJS failed to load:', err);
    });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!emailjsReady) {
        status.textContent = 'Email service not ready — please wait a moment and try again.';
        status.className = 'form-status error';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      status.className = 'form-status';
      status.textContent = '';

      try {
        // Get form data
        const formData = {
          from_name: document.getElementById('name').value,
          from_email: document.getElementById('email').value,
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value,
        };

        // Send email via EmailJS
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          formData
        );

        console.log('Email sent successfully by sender:', formData.from_name);
        status.textContent = "Message sent — I'll be in touch soon.";
        status.className = 'form-status success';
        form.reset();
      } catch (error) {
        console.error('EmailJS error:', error);
        status.textContent = 'Something went wrong. Please try again.';
        status.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });
  }
})();