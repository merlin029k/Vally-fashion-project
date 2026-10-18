document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Basic image protection ----------
       Deters casual right-click/drag saving. This is a soft deterrent only —
       no website can block OS/browser screenshots, and a determined visitor
       can always open dev tools. Paired with the user-select/drag CSS on img. */
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });

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

    /* ---------- Gallery Population & Filtering ----------
       Static catalog — this is a frontend-only site with no backend/database.
       To add, edit, or remove a product, update this list and redeploy. */
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const PRODUCTS = [
        { id: 1, src: 'products/womens-1.jpg', category: 'womens', title: 'Royal Ankara Gown', description: 'Statement womenswear piece in bold traditional print.' },
        { id: 2, src: 'products/womens-2.png', category: 'womens', title: 'Beaded Ceremonial Dress', description: 'Fitted ceremonial dress with hand-finished beadwork detailing.' },
        { id: 3, src: 'products/mens-1.png', category: 'mens', title: 'Heritage Agbada Robe', description: 'Flowing hand-embroidered robe, styled with a traditional headwrap.' },
        { id: 4, src: 'products/mens-2.png', category: 'mens', title: 'Royal Blue Dashiki', description: 'Hand-embroidered dashiki tunic in royal blue with intricate white stitching.' },
        { id: 5, src: 'products/mens-3.png', category: 'mens', title: 'Leopard Print Agbada Set', description: 'Statement two-piece set styled with traditional accents.' },
        { id: 6, src: 'products/accessories-1.png', category: 'accessories', title: 'Tribal Statement Necklace', description: 'Handcrafted statement necklace made from natural materials.' },
        { id: 7, src: 'products/accessories-2.png', category: 'accessories', title: 'Beaded Twist Necklace Set', description: 'Vibrant handmade beaded necklaces, sold as a pair.' },
        { id: 8, src: 'products/accessories-3.png', category: 'accessories', title: 'Carved Pendant Necklace', description: 'Traditional carved wooden pendant necklace with beaded accents.' }
    ];

    let currentFilter = 'all';
    let itemsToShow = 8;

    const formatCategory = (cat) => {
        const formats = { womens: "Women's", mens: "Men's", accessories: 'Accessories' };
        return formats[cat] || cat;
    };

    const renderGallery = () => {
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        const filteredItems = currentFilter === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(item => item.category === currentFilter);

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
                    <img src="${item.src}" alt="${item.title}" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='vally art.png'">
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-cat">${formatCategory(item.category)}</div>
                        <h3 class="gallery-item-title">${item.title}</h3>
                    </div>
                    <div class="gallery-item-zoom">
                        <i class="fas fa-search-plus"></i>
                    </div>
                </div>
            `;

            galleryGrid.insertAdjacentHTML('beforeend', galleryHtml);
        });

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

    renderGallery();

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

    /* ---------- Reservation Form (submits straight to WhatsApp) ----------
       No backend: builds a pre-filled WhatsApp message and hands off to
       wa.me. Update WHATSAPP_NUMBER if the reservation line ever changes. */
    const WHATSAPP_NUMBER = '237675344245';
    const reserveOpenBtn = document.getElementById('reserve-open-btn');
    const reserveModal = document.getElementById('reserve-modal');
    const reserveClose = document.getElementById('reserve-close');
    const reserveForm = document.getElementById('reserve-form');

    function openReserveModal() {
        if (!reserveModal) return;
        reserveModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const firstInput = reserveForm ? reserveForm.querySelector('input, textarea') : null;
        if (firstInput) firstInput.focus();
    }

    function closeReserveModal() {
        if (!reserveModal) return;
        reserveModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (reserveOpenBtn) reserveOpenBtn.addEventListener('click', openReserveModal);
    if (reserveClose) reserveClose.addEventListener('click', closeReserveModal);
    if (reserveModal) {
        reserveModal.addEventListener('click', (e) => {
            if (e.target === reserveModal) closeReserveModal();
        });
    }

    if (reserveForm) {
        reserveForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reserve-name').value.trim();
            const phone = document.getElementById('reserve-phone').value.trim();
            const details = document.getElementById('reserve-message').value.trim();

            if (!name || !details) return;

            const lines = [
                'Hello Vally Fashion! I would like to reserve a piece from the Royal Elegance Series.',
                '',
                `Name: ${name}`
            ];
            if (phone) lines.push(`Phone: ${phone}`);
            lines.push(`Details: ${details}`);

            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
            reserveForm.reset();
            closeReserveModal();
            window.open(waUrl, '_blank', 'noopener');
        });
    }
});
