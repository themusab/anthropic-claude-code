/* ============================================
   STUDIO — Awwwards-Tier Interactions
   Lerp cursor, slide-up preloader,
   staggered reveals, magnetic buttons
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------------
     Utility: Linear interpolation
  ------------------------------------------------ */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /* ------------------------------------------------
     1. PAGE LOADER — letters in, letters out, slide up
  ------------------------------------------------ */
  var loader = document.querySelector('.page-loader');

  window.addEventListener('load', function () {
    // Letters are already animating in via CSS.
    // After they've settled, trigger the "done" class
    // which plays the letter-out + slide-up animations.
    setTimeout(function () {
      if (loader) loader.classList.add('done');
    }, 1100);

    // After the slide-up finishes, reveal the page
    setTimeout(function () {
      document.body.classList.add('loaded');
      if (loader) loader.style.pointerEvents = 'none';
    }, 2100);

    // Clean loader from DOM after all animations done
    setTimeout(function () {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 3200);
  });

  /* ------------------------------------------------
     2. CUSTOM CURSOR — lerp-based, .active on hover
  ------------------------------------------------ */
  var cursor = document.querySelector('.cursor');
  var follower = document.querySelector('.cursor-follower');
  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && follower && isDesktop) {
    var mouseX = -100;
    var mouseY = -100;
    var cursorX = -100;
    var cursorY = -100;
    var followerCurrentX = -100;
    var followerCurrentY = -100;
    var cursorVisible = false;

    // Track real mouse position (no delay)
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        // Snap both to initial position to avoid slide-in from corner
        cursorX = mouseX;
        cursorY = mouseY;
        followerCurrentX = mouseX;
        followerCurrentY = mouseY;
      }
    });

    // Hide cursor when mouse leaves the window
    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    });

    // RAF loop — smooth lerp
    (function tick() {
      // Cursor dot — fast tracking (lerp 0.2)
      cursorX = lerp(cursorX, mouseX, 0.2);
      cursorY = lerp(cursorY, mouseY, 0.2);
      cursor.style.transform =
        'translate3d(' + (cursorX - 5) + 'px, ' + (cursorY - 5) + 'px, 0)';

      // Follower ring — slower tracking (lerp 0.08)
      followerCurrentX = lerp(followerCurrentX, mouseX, 0.08);
      followerCurrentY = lerp(followerCurrentY, mouseY, 0.08);
      follower.style.transform =
        'translate3d(' + (followerCurrentX - 20) + 'px, ' + (followerCurrentY - 20) + 'px, 0)';

      requestAnimationFrame(tick);
    })();

    // .active class on interactive elements
    var hoverTargets = document.querySelectorAll(
      'a, button, .btn, .project-card, .service-item'
    );
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('active');
        follower.classList.add('active');
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('active');
        follower.classList.remove('active');
      });
    });
  }

  /* ------------------------------------------------
     3. MAGNETIC BUTTONS
  ------------------------------------------------ */
  var magneticEls = document.querySelectorAll('.magnetic');

  if (isDesktop && magneticEls.length) {
    magneticEls.forEach(function (el) {
      var strength = 0.35; // pull strength
      var resetEase = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transition = 'none';
        el.style.transform =
          'translate(' + (dx * strength) + 'px, ' + (dy * strength) + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transition = resetEase;
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ------------------------------------------------
     4. NAVIGATION — shrink on scroll
  ------------------------------------------------ */
  var nav = document.querySelector('nav');

  if (nav) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.pageYOffset > 80) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------
     5. MOBILE MENU — hamburger + overlay
  ------------------------------------------------ */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.click();
      }
    });
  }

  /* ------------------------------------------------
     6. SCROLL REVEAL — IntersectionObserver
     Handles data-animate="fade-up"
  ------------------------------------------------ */
  var revealElements = document.querySelectorAll('[data-animate="fade-up"]');

  if (revealElements.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------
     7. COUNTER ANIMATION — count up on scroll
  ------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');

  if (counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          var duration = 2200;
          var startTime = null;

          function easeOutExpo(t) {
            return t >= 1 ? 1 : 1 - Math.pow(2, -12 * t);
          }

          function step(now) {
            if (!startTime) startTime = now;
            var progress = Math.min((now - startTime) / duration, 1);
            el.textContent = Math.floor(easeOutExpo(progress) * target);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target;
            }
          }

          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (c) {
      counterObserver.observe(c);
    });
  }

  /* ------------------------------------------------
     8. SMOOTH ANCHOR SCROLLING
  ------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------
     9. PARALLAX — hero side images
  ------------------------------------------------ */
  var sideImages = document.querySelectorAll('.side-img');

  if (sideImages.length && isDesktop) {
    var parallaxTicking = false;

    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        requestAnimationFrame(function () {
          var scrollY = window.pageYOffset;
          // Only parallax while hero is in view
          if (scrollY < window.innerHeight * 1.2) {
            sideImages[0].style.transform =
              'translateY(calc(-50% + ' + (scrollY * -0.12) + 'px))';
            if (sideImages[1]) {
              sideImages[1].style.transform =
                'translateY(calc(-50% + ' + (scrollY * 0.12) + 'px))';
            }
          }
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------
     10. TILT EFFECT — project cards (perspective)
  ------------------------------------------------ */
  var projectWrappers = document.querySelectorAll('.project-img-wrapper');

  if (isDesktop && projectWrappers.length) {
    projectWrappers.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = ((y - 0.5) * -6).toFixed(2);
        var rotateY = ((x - 0.5) * 6).toFixed(2);
        card.style.transition = 'none';
        card.style.transform =
          'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
      });
    });
  }

})();
