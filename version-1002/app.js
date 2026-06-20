(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }
        }

        if (slides.length) {
            showSlide(0);
            startHero();
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startHero();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startHero();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    startHero();
                });
            });
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var searchInput = document.querySelector("[data-movie-search]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeFilter = "all";

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" "));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
                var matchFilter = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
                var show = matchKeyword && matchRegion && matchFilter;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }
        if (regionSelect) {
            regionSelect.addEventListener("change", applyFilters);
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeFilter = button.getAttribute("data-filter-value") || "all";
                applyFilters();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && searchInput) {
            searchInput.value = query;
            applyFilters();
        }
    });

    window.initMoviePlayer = function (movieUrl) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var message = document.querySelector("[data-player-message]");
        var attached = false;
        var hls = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function attach() {
            if (!video || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = movieUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(movieUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("播放遇到问题，请稍后重试");
                    }
                });
            } else {
                video.src = movieUrl;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 && overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
