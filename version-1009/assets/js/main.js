(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-nav');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function bindHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('.hero-slide', carousel);
    var dots = selectAll('.hero-dot', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function filterCards(input, scope, extraTerm) {
    var term = ((input && input.value) || '').trim().toLowerCase();
    var add = (extraTerm || '').trim().toLowerCase();
    selectAll('.search-item', scope).forEach(function (card) {
      var text = getText(card);
      var okTerm = !term || text.indexOf(term) !== -1;
      var okAdd = !add || text.indexOf(add) !== -1;
      card.hidden = !(okTerm && okAdd);
    });
  }

  function bindLocalSearch() {
    selectAll('[data-local-search]').forEach(function (input) {
      var scope = document.querySelector('[data-search-scope]');
      if (!scope) {
        return;
      }
      input.addEventListener('input', function () {
        filterCards(input, scope, '');
      });
    });
  }

  function bindGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var scope = document.querySelector('[data-search-scope]');
    if (!input || !scope) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var startValue = params.get('q') || '';
    if (startValue) {
      input.value = startValue;
    }
    var activeFilter = '';

    function run() {
      filterCards(input, scope, activeFilter);
    }

    input.addEventListener('input', run);
    selectAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        selectAll('.filter-chip').forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || '';
        run();
      });
    });

    var clearButton = document.getElementById('clearSearchButton');
    if (clearButton) {
      clearButton.addEventListener('click', function () {
        input.value = '';
        activeFilter = '';
        selectAll('.filter-chip').forEach(function (item, index) {
          item.classList.toggle('is-active', index === 0);
        });
        run();
      });
    }
    run();
  }

  window.setupInlinePlayer = function (videoSelector, buttonSelector, overlaySelector, streamUrl) {
    var video = document.querySelector(videoSelector);
    var button = document.querySelector(buttonSelector);
    var overlay = document.querySelector(overlaySelector);
    if (!video || !button || !overlay || !streamUrl) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindLocalSearch();
    bindGlobalSearch();
  });
})();
