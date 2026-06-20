(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 6200);
    }

    function filterArea(area) {
        var input = area.querySelector('[data-search-input]');
        var typeSelect = area.querySelector('[data-filter-type]');
        var yearSelect = area.querySelector('[data-filter-year]');
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));
        var shown = 0;

        cards.forEach(function (card) {
            var searchText = card.getAttribute('data-search') || '';
            var cardType = card.getAttribute('data-type') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = true;

            if (query && searchText.indexOf(query) === -1) {
                matched = false;
            }

            if (type && cardType.indexOf(type) === -1) {
                matched = false;
            }

            if (year && cardYear.indexOf(year) === -1) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                shown += 1;
            }
        });

        var empty = area.querySelector('[data-empty-state]');
        if (empty) {
            empty.hidden = shown !== 0;
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function (area) {
        Array.prototype.slice.call(area.querySelectorAll('[data-search-input], [data-filter-type], [data-filter-year]')).forEach(function (control) {
            control.addEventListener('input', function () {
                filterArea(area);
            });
            control.addEventListener('change', function () {
                filterArea(area);
            });
        });
    });

    var player = document.getElementById('moviePlayer');
    var playButton = document.querySelector('[data-play-trigger]');
    var hlsInstance = null;

    function sourceUrl() {
        if (!player) {
            return '';
        }

        var child = player.querySelector('source');
        return child ? child.src : player.currentSrc || player.src;
    }

    function preparePlayer() {
        if (!player || player.getAttribute('data-ready') === '1') {
            return;
        }

        var url = sourceUrl();
        if (!url) {
            return;
        }

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(player);
        } else {
            player.src = url;
        }

        player.setAttribute('data-ready', '1');
    }

    function startPlayer() {
        if (!player) {
            return;
        }

        preparePlayer();
        if (playButton) {
            playButton.classList.add('is-hidden');
        }

        var playPromise = player.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayer);
    }

    if (player) {
        player.addEventListener('click', function () {
            if (player.paused) {
                startPlayer();
            }
        });
        player.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
