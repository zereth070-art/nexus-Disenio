// 1. Cambio de tema claro/oscuro 
(function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('nexus-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const theme = saved || preferred;
    root.setAttribute('data-bs-theme', theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
        const apply = (t) => {
            btn.textContent = t === 'dark' ? '🌙' : '☀️';
            btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
        };
        apply(theme);
        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-bs-theme', next);
            localStorage.setItem('nexus-theme', next);
            apply(next);
        });
    }
})();

// 2. Filtro de búsqueda en biblioteca/descubrir (manipulación del DOM)
(function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const cards = document.querySelectorAll('.card');
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        cards.forEach((card) => {
            const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
            card.closest('.col')?.classList.toggle('d-none', q !== '' && !title.includes(q));
        });
    });
})();

// 3. Soporte para carrusel si Bootstrap JS no está cargado (offline / file://)
(function initCarouselFallback() {
    if (typeof bootstrap !== 'undefined') return;
    document.addEventListener('click', (e) => {
        const control = e.target.closest('.carousel-control-prev, .carousel-control-next');
        if (!control) return;
        e.preventDefault();
        const targetId = control.getAttribute('data-bs-target') || control.getAttribute('data-target') || control.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;
        const carousel = document.querySelector(targetId);
        if (!carousel) return;
        const items = carousel.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const activeIdx = Array.from(items).findIndex((el) => el.classList.contains('active'));
        if (activeIdx === -1) return;
        const isNext = control.classList.contains('carousel-control-next') ||
                       control.getAttribute('data-bs-slide') === 'next' ||
                       control.getAttribute('data-slide') === 'next';
        const nextIdx = isNext ? (activeIdx + 1) % items.length : (activeIdx - 1 + items.length) % items.length;
        carousel.querySelectorAll('video').forEach((v) => v.pause());
        items[activeIdx].classList.remove('active');
        items[nextIdx].classList.add('active');
    });
})();

// 4. Gestión de reproducción de vídeos en carruseles
(function initCarouselVideos() {
    document.querySelectorAll('.carousel').forEach((carousel) => {
        carousel.addEventListener('slide.bs.carousel', () => {
            carousel.querySelectorAll('video').forEach((v) => v.pause());
        });
        carousel.querySelectorAll('video').forEach((video) => {
            video.addEventListener('play', () => {
                if (window.bootstrap && bootstrap.Carousel) {
                    const inst = bootstrap.Carousel.getInstance(carousel);
                    if (inst) inst.pause();
                }
            });
        });
    });
})();
