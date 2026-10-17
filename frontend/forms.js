/* ======================================
   VALLY FASHION - Newsletter Form
   Client-side only — this is a frontend-only site with no backend,
   so there's nowhere to actually send a subscription yet. Replace
   the TODO below with a real provider (Mailchimp, Resend, Netlify
   Forms, etc.) when one is wired up.
   ====================================== */

(function () {
  'use strict';

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');

        if (!emailInput || !isValidEmail(emailInput.value.trim())) {
          emailInput.setAttribute('aria-invalid', 'true');
          emailInput.style.borderColor = '#ff4d4d';
          return;
        }

        emailInput.style.borderColor = '';
        emailInput.setAttribute('aria-invalid', 'false');

        // TODO: replace with a real newsletter API call (e.g. Mailchimp/Resend)
        alert('Subscribed! Thank you for joining our newsletter.');
        newsletterForm.reset();
      });
    }
  });
})();
