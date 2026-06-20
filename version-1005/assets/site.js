(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setActiveSlide(root, index) {
        var slides = root.querySelectorAll("[data-hero-slide]");
        var dots = root.querySelectorAll("[data-hero-dot]");
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
        root.dataset.heroIndex = index;
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = root.querySelectorAll("[data-hero-slide]");
        var dots = root.querySelectorAll("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setActiveSlide(root, Number(dot.dataset.heroDot || 0));
            });
        });
        window.setInterval(function () {
            var current = Number(root.dataset.heroIndex || 0);
            setActiveSlide(root, (current + 1) % slides.length);
        }, 5600);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        function apply() {
            var keyword = normalize(input && input.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            list.querySelectorAll(".movie-card").forEach(function (card) {
                var haystack = normalize(card.dataset.search);
                var cardType = normalize(card.dataset.type);
                var cardYear = normalize(card.dataset.year);
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !typeValue || cardType === typeValue;
                var matchYear = !yearValue || cardYear === yearValue;
                card.classList.toggle("is-hidden", !(matchKeyword && matchType && matchYear));
            });
        }
        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var hlsInstance = null;
        if (!video || !button || !source) {
            return;
        }
        function loadAndPlay() {
            button.classList.add("is-hidden");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.src) {
                    video.src = source;
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
                return;
            }
            if (!video.src) {
                video.src = source;
            }
            video.play().catch(function () {});
        }
        button.addEventListener("click", loadAndPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
