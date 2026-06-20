(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  var search = document.querySelector('.header-search');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (search) {
        search.classList.toggle('open');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var genre = form.querySelector('[data-filter-genre]');
    var year = form.querySelector('[data-filter-year]');
    var scope = document.querySelector(form.getAttribute('data-filter-scope')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-message]');

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var genreValue = genre ? genre.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilter);
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
      applyFilter();
    }
  });
})();
