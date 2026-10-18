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
        { id: 8, src: 'products/accessories-3.png', category: 'accessories', title: 'Carved Pendant Necklace', description: 'Traditional carved wooden pendant necklace with beaded accents.' },
        { id: 9, src: 'products/vally_post_2.jpg', category: 'mens', title: 'Embroidered Velvet Agbada', description: 'Hand-embroidered velvet agbada set with matching tam, styled in gold and red.' },
        { id: 10, src: 'products/vally_post_3.jpg', category: 'womens', title: 'Geometric Pattern Gown', description: 'Fitted gown in deep tones with bold geometric embroidery and velvet trim.' },
        { id: 11, src: 'products/vally_post_4.jpg', category: 'womens', title: 'Sequined Asymmetric Dress', description: 'Navy and orange sequined dress with an asymmetric wrap bodice and beaded necklace.' },
        { id: 12, src: 'products/vally_post_6.jpg', category: 'womens', title: 'Tribal Print Fringe Gown', description: 'Statement gown pairing bold tribal print with a textured fur-trim headpiece.' },
        { id: 13, src: 'products/vally_post_7.jpg', category: 'womens', title: 'Shimmer Top Ensemble', description: 'Metallic shimmer top paired with an embroidered tiered skirt and shell necklace.' },
        { id: 14, src: 'products/vally_post_8.jpg', category: 'mens', title: 'Leopard Band Agbada Set', description: 'Blue and red hand-embroidered agbada set styled with a leopard-print headband.' },
        { id: 15, src: 'products/vally_post_9.jpg', category: 'mens', title: 'Royal Beaded Ceremonial Robe', description: 'Red and gold ceremonial robe with intricate beadwork and traditional headdress.' },
        { id: 16, src: 'products/vally_post_11.jpg', category: 'mens', title: 'Monochrome Tribal Robe', description: 'Black, white and red embroidered robe styled with a layered beaded necklace.' },
        { id: 17, src: 'products/vally_post_12.jpg', category: 'womens', title: 'Lace & Sequin Fringe Dress', description: 'Floor-length black lace dress with sequin banding and fringed sleeves.' },
        { id: 18, src: 'products/vally_post_13.jpg', category: 'womens', title: 'Beaded Beret Tribal Gown', description: 'Tribal-print gown with intricate trim detailing, styled with a beaded beret.' },
        { id: 19, src: 'products/vally_post_15.jpg', category: 'mens', title: 'Maroon Velvet Royal Robe', description: 'Maroon velvet robe with gold and silver embroidery, styled with a beaded necklace.' },
        { id: 20, src: 'products/vally_post_17.jpg', category: 'womens', title: 'Beaded Mermaid Gown', description: 'Mermaid-cut gown with glass-bead embroidery and a matching crochet cap.' },
        { id: 21, src: 'products/vally_post_19.jpg', category: 'womens', title: 'Indigo Tribal Print Gown', description: 'Indigo and cream tribal-print gown with velvet trim and fringed hem.' },
        { id: 22, src: 'products/vally_post_21.jpg', category: 'womens', title: 'Sequined Diamond Pattern Gown', description: 'Sequined gown with diamond-pattern embroidery, styled with a beaded crochet cap.' },
        { id: 23, src: 'products/vally_dress_post_v2.jpg', category: 'womens', title: 'Signature Embroidered Gown', description: 'Signature embroidered gown showcasing fine hand-finished detailing.' }
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
                        <button type="button" class="gallery-item-get-btn" data-product-title="${item.title}">
                            <i class="fab fa-whatsapp"></i> Get Yours
                        </button>
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

    const lightboxGetBtn = document.getElementById('lightbox-get-btn');

    let currentImageIndex = 0;
    let currentLightboxImages = [];
    let lastFocusedElement = null;
    let currentLightboxTitle = '';

    function attachLightboxListeners() {
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach((item, index) => {
            const activate = () => {
                const visibleItems = document.querySelectorAll('.gallery-item.visible img');
                currentLightboxImages = Array.from(visibleItems).map(img => ({ src: img.src, title: img.alt }));
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

        document.querySelectorAll('.gallery-item-get-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openReserveModal(btn.dataset.productTitle);
            });
        });
    }

    function showLightboxImage() {
        const current = currentLightboxImages[currentImageIndex];
        if (!current) return;
        lightboxImg.src = current.src;
        lightboxImg.alt = current.title;
        currentLightboxTitle = current.title;
    }

    function openLightbox(item) {
        if (!lightbox || !lightboxImg) return;
        showLightboxImage();
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
        showLightboxImage();
    }

    function prevImage() {
        if (currentLightboxImages.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
        showLightboxImage();
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
        bindActivatable(lightboxGetBtn, () => openReserveModal(currentLightboxTitle));

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
    const reserveSubtitle = document.getElementById('reserve-subtitle');
    const reserveMessageField = document.getElementById('reserve-message');

    function openReserveModal(productTitle) {
        if (!reserveModal) return;
        const title = typeof productTitle === 'string' ? productTitle.trim() : '';
        reserveModal.dataset.product = title;

        if (reserveSubtitle) {
            reserveSubtitle.textContent = title
                ? `${title} — fill this in and we'll open WhatsApp with your details ready to send.`
                : "Royal Elegance Series — fill this in and we'll open WhatsApp with your details ready to send.";
        }
        if (reserveMessageField) {
            reserveMessageField.placeholder = title
                ? `Size, colour, and any preferences for the "${title}"?`
                : 'Which piece, size, colour, and any preferences?';
        }

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

    if (reserveOpenBtn) reserveOpenBtn.addEventListener('click', () => openReserveModal());
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

            const productTitle = reserveModal.dataset.product || '';
            const lines = [
                productTitle
                    ? `Hello Vally Fashion! I would like to reserve the "${productTitle}".`
                    : 'Hello Vally Fashion! I would like to reserve a piece from the Royal Elegance Series.',
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
