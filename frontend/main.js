document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');

    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 800);
        });

        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                preloader.classList.add('hidden');
            }
        }, 3000);
    }

    /* ---------- Navigation & Scroll ---------- */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        const navLinksItems = navLinks.querySelectorAll('a');

        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /* ---------- Hero Slider ---------- */
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    if (heroSlides.length > 0) {
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 6000);
    }

    /* ---------- Scroll Reveal ---------- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('revealed');
            }
        });
    };

    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);

    /* ---------- Gallery Population & Filtering ---------- */
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const API_BASE_URL = (typeof VALLY_CONFIG !== 'undefined' && VALLY_CONFIG.API_BASE_URL) || 'http://localhost:4000';

    let allGalleryItems = [];
    let currentFilter = 'all';
    let itemsToShow = 8;

    const formatCategory = (cat) => {
        const formats = { womens: "Women's", mens: "Men's", accessories: 'Accessories' };
        return formats[cat] || cat;
    };

    // Maps a backend product record to the shape the gallery renderer expects
    const mapProduct = (p) => ({
        id: p.id,
        src: p.image_url.startsWith('http') ? p.image_url : `${API_BASE_URL}${p.image_url}`,
        category: p.category,
        title: p.title,
        description: p.description || ''
    });

    async function loadGalleryFromApi() {
        if (!galleryGrid) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/products?in_stock=true`);
            if (!res.ok) throw new Error(`API responded with status ${res.status}`);

            const data = await res.json();
            allGalleryItems = (data.products || []).map(mapProduct);
        } catch (err) {
            console.error('Could not load products from the API:', err);
            galleryGrid.innerHTML = `
                <p style="grid-column: 1 / -1; text-align:center; color: var(--medium-gray);">
                    We couldn't load the latest collection right now. Please refresh the page,
                    or contact us directly on WhatsApp in the meantime.
                </p>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        renderGallery();
    }


    const renderGallery = () => {
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        const filteredItems = currentFilter === 'all'
            ? allGalleryItems
            : allGalleryItems.filter(item => item.category === currentFilter);

        const itemsToRender = filteredItems.slice(0, itemsToShow);

        if (itemsToRender.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align:center; color: var(--medium-gray);">No items found in this category yet. Check back soon.</p>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        itemsToRender.forEach((item, index) => {
            const delay = index * 100;

            const galleryHtml = `
                <div class="gallery-item" data-category="${item.category}" data-product-id="${item.id}" style="transition-delay: ${delay}ms" tabindex="0" role="button" aria-label="View ${item.title}">
                    <img src="${item.src}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='vally art.png'">
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-cat">${formatCategory(item.category)}</div>
                        <h3 class="gallery-item-title">${item.title}</h3>
                        <button type="button" class="gallery-item-inquire" data-inquire-id="${item.id}" data-inquire-title="${item.title}">
                            <i class="fas fa-comment-dots"></i> Ask about this piece
                        </button>
                    </div>
                    <div class="gallery-item-zoom">
                        <i class="fas fa-search-plus"></i>
                    </div>
                </div>
            `;

            galleryGrid.insertAdjacentHTML('beforeend', galleryHtml);
        });

        attachInquireListeners();

        setTimeout(() => {
            const items = document.querySelectorAll('.gallery-item');
            items.forEach(item => item.classList.add('visible'));
        }, 50);

        if (loadMoreBtn) {
            if (itemsToRender.length >= filteredItems.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
                loadMoreBtn.querySelector('i').classList.remove('fa-spin');
            }
        }

        attachLightboxListeners();
    };

    loadGalleryFromApi();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentFilter = btn.dataset.filter;
            itemsToShow = 8;
            renderGallery();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreBtn.querySelector('i').classList.add('fa-spin');
            setTimeout(() => {
                itemsToShow += 4;
                renderGallery();
            }, 600);
        });
    }

    /* ---------- Lightbox ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentImageIndex = 0;
    let currentLightboxImages = [];
    let lastFocusedElement = null;

    function attachLightboxListeners() {
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach((item, index) => {
            const activate = () => {
                const visibleItems = document.querySelectorAll('.gallery-item.visible img');
                currentLightboxImages = Array.from(visibleItems).map(img => img.src);
                currentImageIndex = index;
                lastFocusedElement = item;
                openLightbox(currentLightboxImages[currentImageIndex]);
            };

            item.addEventListener('click', activate);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate();
                }
            });
        });
    }

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
            }
        }, 400);
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function nextImage() {
        if (currentLightboxImages.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % currentLightboxImages.length;
        lightboxImg.src = currentLightboxImages[currentImageIndex];
    }

    function prevImage() {
        if (currentLightboxImages.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
        lightboxImg.src = currentLightboxImages[currentImageIndex];
    }

    function bindActivatable(el, handler) {
        if (!el) return;
        el.addEventListener('click', handler);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    }

    if (lightbox) {
        bindActivatable(lightboxClose, closeLightbox);
        bindActivatable(lightboxNext, nextImage);
        bindActivatable(lightboxPrev, prevImage);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }

    /* ---------- Product Inquiry Modal ---------- */
    const inquiryModal = document.getElementById('inquiry-modal');
    const inquiryForm = document.getElementById('inquiry-form');
    const inquiryProductLabel = document.getElementById('inquiry-product-label');
    const inquiryProductIdInput = document.getElementById('inquiry-product-id');
    const inquiryClose = document.getElementById('inquiry-close');
    const inquiryStatus = document.getElementById('inquiry-status');

    function attachInquireListeners() {
        document.querySelectorAll('[data-inquire-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't also trigger the lightbox
                openInquiryModal(btn.dataset.inquireId, btn.dataset.inquireTitle);
            });
        });
    }

    function openInquiryModal(productId, productTitle) {
        if (!inquiryModal) return;
        if (inquiryProductLabel) inquiryProductLabel.textContent = productTitle || '';
        if (inquiryProductIdInput) inquiryProductIdInput.value = productId || '';
        if (inquiryStatus) inquiryStatus.textContent = '';
        inquiryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const firstInput = inquiryForm ? inquiryForm.querySelector('input, textarea') : null;
        if (firstInput) firstInput.focus();
    }

    function closeInquiryModal() {
        if (!inquiryModal) return;
        inquiryModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (inquiryClose) inquiryClose.addEventListener('click', closeInquiryModal);
    if (inquiryModal) {
        inquiryModal.addEventListener('click', (e) => {
            if (e.target === inquiryModal) closeInquiryModal();
        });
    }

    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = inquiryForm.querySelector('#inquiry-name').value.trim();
            const email = inquiryForm.querySelector('#inquiry-email').value.trim();
            const message = inquiryForm.querySelector('#inquiry-message').value.trim();
            const productId = inquiryProductIdInput ? inquiryProductIdInput.value : null;

            if (!name || !email || !message) {
                if (inquiryStatus) {
                    inquiryStatus.textContent = 'Please fill in all fields.';
                    inquiryStatus.style.color = '#e60000';
                }
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productId || undefined, name, email, message })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Something went wrong.');
                }

                if (inquiryStatus) {
                    inquiryStatus.textContent = 'Thank you! We will get back to you within 24 hours.';
                    inquiryStatus.style.color = '#2e7d32';
                }
                inquiryForm.reset();
                setTimeout(closeInquiryModal, 2000);
            } catch (err) {
                console.error('Inquiry submission failed:', err);
                if (inquiryStatus) {
                    inquiryStatus.textContent = "Could not send your inquiry — please try WhatsApp instead.";
                    inquiryStatus.style.color = '#e60000';
                }
            }
        });
    }
});
