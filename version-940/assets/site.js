(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle("active", current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle("active", current === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function filterCards(panel) {
    var grid = panel.parentElement.querySelector("[data-card-grid]");
    var input = panel.querySelector("[data-card-search]");
    var activeChip = panel.querySelector("[data-filter-chip].active");
    var query = input ? normalize(input.value) : "";
    var chipValue = activeChip ? normalize(activeChip.getAttribute("data-filter-value")) : "";

    if (!grid) {
      grid = document.querySelector("[data-card-grid]");
    }

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre")
      ].join(" "));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchChip = !chipValue || text.indexOf(chipValue) !== -1;
      card.classList.toggle("is-hidden", !(matchQuery && matchChip));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".filter-panel")).forEach(function (panel) {
    var input = panel.querySelector("[data-card-search]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));

    if (input) {
      input.addEventListener("input", function () {
        filterCards(panel);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        filterCards(panel);
      });
    });
  });
}());
