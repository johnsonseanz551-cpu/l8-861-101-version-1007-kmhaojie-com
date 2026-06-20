(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
      button.textContent = opened ? '×' : '☰';
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (index < 0) {
      index = 0;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    function apply() {
      var query = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchQuery = !query || text.indexOf(query) >= 0;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')).indexOf(selectedYear) >= 0;
          var matchType = !selectedType || normalize(card.getAttribute('data-type')).indexOf(selectedType) >= 0;
          card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
        });
      });
    }
    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    apply();
  }

  function startPlayer(video) {
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var shell = video.closest('.player-shell');
    if (!stream) {
      return;
    }
    if (shell) {
      shell.classList.add('is-playing');
    }
    video.controls = true;
    if (video.getAttribute('data-ready') === 'true') {
      var replay = video.play();
      if (replay && replay.catch) {
        replay.catch(function () {});
      }
      return;
    }
    video.setAttribute('data-ready', 'true');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.load();
      var nativePlay = video.play();
      if (nativePlay && nativePlay.catch) {
        nativePlay.catch(function () {});
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        var hlsPlay = video.play();
        if (hlsPlay && hlsPlay.catch) {
          hlsPlay.catch(function () {});
        }
      });
      return;
    }
    video.src = stream;
    video.load();
    var fallbackPlay = video.play();
    if (fallbackPlay && fallbackPlay.catch) {
      fallbackPlay.catch(function () {});
    }
  }

  function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('.player-shell');
        var video = shell ? shell.querySelector('video[data-stream]') : null;
        startPlayer(video);
      });
    });
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-stream]'));
    videos.forEach(function (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(video);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card" data-movie-card>',
      '<a class="card-cover-link" href="' + escapeHtml(item.url) + '">',
      '<img class="card-cover" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-type">' + escapeHtml(item.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<div class="card-tags"><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var box = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    if (!box || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    box.value = initial;
    function render() {
      var query = normalize(box.value);
      var data = window.SEARCH_INDEX;
      var matched = data.filter(function (item) {
        if (!query) {
          return true;
        }
        return normalize([item.title, item.year, item.type, item.region, item.genre, item.tags, item.oneLine].join(' ')).indexOf(query) >= 0;
      }).slice(0, 96);
      if (!matched.length) {
        results.innerHTML = '<div class="search-results-empty">没有找到相关影片</div>';
        return;
      }
      results.innerHTML = matched.map(renderSearchCard).join('');
    }
    box.addEventListener('input', render);
    var form = document.querySelector('[data-search-page-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
