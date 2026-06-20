(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './movies.html';
            }
        });
    });

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function applyFilters(panel) {
        var root = panel.parentElement;
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var searchInput = panel.querySelector('[data-local-search]');
        var categoryFilter = panel.querySelector('[data-category-filter]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var typeFilter = panel.querySelector('[data-type-filter]');
        var emptyState = panel.querySelector('[data-empty-state]');
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchCategory = !category || card.getAttribute('data-category') === category;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var cardType = card.getAttribute('data-type') || '';
            var matchType = !type || cardType.indexOf(type) !== -1;
            var visible = matchQuery && matchCategory && matchYear && matchType;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    document.querySelectorAll('[data-filter-list]').forEach(function (panel) {
        var inputs = panel.querySelectorAll('input, select');
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                applyFilters(panel);
            });
            input.addEventListener('change', function () {
                applyFilters(panel);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var searchInput = panel.querySelector('[data-local-search]');
        if (q && searchInput) {
            searchInput.value = q;
        }
        applyFilters(panel);
    });

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playOverlay');
        var message = document.getElementById('playerMessage');
        var ready = false;
        var hls = null;

        if (!video || !overlay || !sourceUrl) {
            return;
        }

        function showMessage() {
            if (message) {
                message.hidden = false;
            }
        }

        function loadSource() {
            if (ready) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage();
                        if (hls) {
                            hls.destroy();
                        }
                    }
                });
                return;
            }

            showMessage();
        }

        function beginPlay() {
            loadSource();
            overlay.classList.add('is-hidden');
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', beginPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlay();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
