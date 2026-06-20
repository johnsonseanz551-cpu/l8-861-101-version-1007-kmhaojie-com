(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const open = mobileNav.hasAttribute("hidden");
            if (open) {
                mobileNav.removeAttribute("hidden");
            } else {
                mobileNav.setAttribute("hidden", "");
            }
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const filterArea = document.querySelector(".filter-area");
    if (!filterArea) {
        return;
    }

    const searchInput = filterArea.querySelector(".site-search");
    const selects = Array.from(filterArea.querySelectorAll(".filter-select"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getNeedle(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year,
            card.dataset.type
        ].join(" "));
    }

    function applyFilters() {
        const query = normalize(searchInput ? searchInput.value : "");
        const selected = {};

        selects.forEach(function (select) {
            selected[select.dataset.filter] = normalize(select.value);
        });

        cards.forEach(function (card) {
            const textMatch = !query || getNeedle(card).includes(query);
            const yearMatch = !selected.year || normalize(card.dataset.year) === selected.year;
            const typeMatch = !selected.type || normalize(card.dataset.type) === selected.type;
            const visible = textMatch && yearMatch && typeMatch;
            card.classList.toggle("is-filtered-out", !visible);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });
}());
