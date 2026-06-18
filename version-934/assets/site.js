(function () {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (button && nav) {
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const searchInput = document.querySelector('[data-card-search]');
  const chips = Array.from(document.querySelectorAll('[data-filter-value]'));

  const normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  const cardText = function (card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ');
  };

  const applyFilter = function (value) {
    const term = normalize(value);
    const cards = Array.from(document.querySelectorAll('.filterable-card'));
    cards.forEach(function (card) {
      const matched = !term || normalize(cardText(card)).includes(term);
      card.classList.toggle('is-hidden', !matched);
    });
    chips.forEach(function (chip) {
      chip.classList.toggle('active', normalize(chip.getAttribute('data-filter-value')) === term);
    });
  };

  if (searchInput) {
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', function () {
      applyFilter(searchInput.value);
    });
    applyFilter(searchInput.value);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const value = chip.getAttribute('data-filter-value') || '';
      if (searchInput) {
        searchInput.value = value;
      }
      applyFilter(value);
    });
  });
})();
