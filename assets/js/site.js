(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-year"));
    var typeSelects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-type"));
    var categorySelects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-category"));

    function firstValue(nodes) {
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i].value) {
          return nodes[i].value.trim().toLowerCase();
        }
      }
      return "";
    }

    function apply() {
      var query = firstValue(searchInputs);
      var year = firstValue(yearSelects);
      var type = firstValue(typeSelects);
      var category = firstValue(categorySelects);
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
        var visible = true;
        if (query && search.indexOf(query) === -1) {
          visible = false;
        }
        if (year && cardYear.indexOf(year) === -1) {
          visible = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          visible = false;
        }
        if (category && cardCategory !== category) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    }

    searchInputs.concat(yearSelects, typeSelects, categorySelects).forEach(function (node) {
      node.addEventListener("input", apply);
      node.addEventListener("change", apply);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
