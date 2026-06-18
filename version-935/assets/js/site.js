(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const filterSection = document.querySelector('[data-filter-section]');

    if (!filterSection) {
        return;
    }

    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const textInput = filterSection.querySelector('[data-filter-text]');
    const yearSelect = filterSection.querySelector('[data-filter-year]');
    const typeSelect = filterSection.querySelector('[data-filter-type]');
    const regionSelect = filterSection.querySelector('[data-filter-region]');
    const categorySelect = filterSection.querySelector('[data-filter-category]');
    const resetButton = filterSection.querySelector('[data-filter-reset]');
    const countNode = document.querySelector('[data-visible-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && textInput) {
        textInput.value = query;
    }

    function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase();
    }

    function matches(card, queryText, year, type, region, category) {
        const haystack = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.region,
            card.dataset.type,
            card.textContent
        ].map(normalize).join(' ');

        const sameYear = !year || normalize(card.dataset.year) === year;
        const sameType = !type || normalize(card.dataset.type).includes(type);
        const sameRegion = !region || normalize(card.dataset.region).includes(region);
        const sameCategory = !category || haystack.includes(category);
        const sameText = !queryText || haystack.includes(queryText);

        return sameText && sameYear && sameType && sameRegion && sameCategory;
    }

    function applyFilters() {
        const queryText = valueOf(textInput);
        const year = valueOf(yearSelect);
        const type = valueOf(typeSelect);
        const region = valueOf(regionSelect);
        const category = valueOf(categorySelect);
        let visible = 0;

        cards.forEach(function (card) {
            const show = matches(card, queryText, year, type, region, category);
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (countNode) {
            countNode.textContent = visible.toString();
        }

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    [textInput, yearSelect, typeSelect, regionSelect, categorySelect].forEach(function (element) {
        if (!element) {
            return;
        }

        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            [textInput, yearSelect, typeSelect, regionSelect, categorySelect].forEach(function (element) {
                if (element) {
                    element.value = '';
                }
            });
            applyFilters();
        });
    }

    applyFilters();
})();
