/* ======================================
   VALLY FASHION - Form Validation
   Real client-side validation with inline
   error messages, then a real submission to
   the backend API.
   ====================================== */

(function () {
  'use strict';

  const API_BASE_URL = (typeof VALLY_CONFIG !== 'undefined' && VALLY_CONFIG.API_BASE_URL) || 'http://localhost:4000';

  function showError(inputEl, message) {
    const errorEl = document.getElementById(inputEl.id + '-error');
    if (errorEl) errorEl.textContent = message;
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    if (!value) return true; // phone is optional
    return /^[+\d][\d\s-]{6,}$/.test(value);
  }

  function validateContactForm(form) {
    let valid = true;

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const message = form.querySelector('#message');

    if (!name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    } else {
      showError(name, '');
    }

    if (!email.value.trim() || !isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    } else {
      showError(email, '');
    }

    if (!isValidPhone(phone.value.trim())) {
      showError(phone, 'Please enter a valid phone number.');
      valid = false;
    } else {
      showError(phone, '');
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'Please enter a message of at least 10 characters.');
      valid = false;
    } else {
      showError(message, '');
    }

    return valid;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');

    if (contactForm) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateContactForm(contactForm)) {
          if (statusEl) {
            statusEl.textContent = 'Please fix the errors above and try again.';
            statusEl.style.color = '#e60000';
          }
          return;
        }

        const name = contactForm.querySelector('#name').value.trim();
        const email = contactForm.querySelector('#email').value.trim();
        const phone = contactForm.querySelector('#phone').value.trim();
        const message = contactForm.querySelector('#message').value.trim();

        if (submitBtn) submitBtn.disabled = true;
        if (statusEl) {
          statusEl.textContent = 'Sending…';
          statusEl.style.color = 'var(--medium-gray)';
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, message })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Something went wrong.');
          }

          if (statusEl) {
            statusEl.textContent = 'Thank you! Your message has been received — we will reply within 24 hours.';
            statusEl.style.color = '#2e7d32';
          }
          contactForm.reset();
        } catch (err) {
          console.error('Contact form submission failed:', err);
          if (statusEl) {
            statusEl.textContent = 'Could not send your message — please try WhatsApp instead.';
            statusEl.style.color = '#e60000';
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

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
