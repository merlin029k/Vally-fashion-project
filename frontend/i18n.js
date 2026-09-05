/* ======================================
   VALLY FASHION - i18n (English / French)
   Simple, dependency-free translation layer.
   Add more data-i18n keys in the HTML and
   matching entries below to expand coverage.
   ====================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'vally_lang';

  const translations = {
    en: {
      nav_home: 'Home',
      nav_about: 'About',
      nav_collections: 'Collections',
      nav_training: 'Training',
      nav_contact: 'Contact',
      nav_visit: 'Visit Us',
      hero_badge: 'Premium African Heritage',
      hero_title: 'Embrace the <span class="accent">Culture</span> of Elegance',
      hero_subtitle: 'Authentic Traditional African Fashion',
      hero_desc: 'Discover our exclusive collection of authentic African clothing, jewelry, fabrics, and cultural art. Located at the heart of Yaoundé, we bring tradition and modern luxury together.',
      hero_cta_explore: 'Explore Collections',
      hero_cta_story: 'Our Story'
    },
    fr: {
      nav_home: 'Accueil',
      nav_about: 'À propos',
      nav_collections: 'Collections',
      nav_training: 'Formation',
      nav_contact: 'Contact',
      nav_visit: 'Nous rendre visite',
      hero_badge: 'Héritage Africain Premium',
      hero_title: "Embrassez la <span class=\"accent\">Culture</span> de l'Élégance",
      hero_subtitle: 'Mode Africaine Traditionnelle Authentique',
      hero_desc: "Découvrez notre collection exclusive de vêtements, bijoux, tissus et art culturel africains authentiques. Situé au cœur de Yaoundé, nous marions tradition et luxe moderne.",
      hero_cta_explore: 'Voir les Collections',
      hero_cta_story: 'Notre Histoire'
    }
  };

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage unavailable — language choice just won't persist */
    }
  }

  function applyLang(lang) {
    const dict = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key]) el.innerHTML = dict[key];
    });

    document.documentElement.setAttribute('lang', lang);
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = lang === 'en' ? 'FR' : 'EN';
      toggleBtn.setAttribute('aria-label', lang === 'en' ? 'Switch to French' : 'Passer en anglais');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const currentLang = getSavedLang();
    applyLang(currentLang);

    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const next = getSavedLang() === 'en' ? 'fr' : 'en';
        saveLang(next);
        applyLang(next);
      });
    }
  });
})();
