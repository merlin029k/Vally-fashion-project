/* ======================================
   VALLY FASHION - Testimonials Carousel
   Auto-rotates every 6s, pausable via dots,
   fully keyboard accessible.
   ====================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');

    if (!cards.length) return;

    let current = 0;
    let timer = null;

    function show(index) {
      cards.forEach((card, i) => card.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      current = index;
    }

    function next() {
      show((current + 1) % cards.length);
    }

    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(next, 6000);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        startAutoplay();
      });
    });

    startAutoplay();
  });
})();
