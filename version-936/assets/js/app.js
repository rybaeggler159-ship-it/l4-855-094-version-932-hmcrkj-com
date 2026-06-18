(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-select]');
  var typeSelect = document.querySelector('[data-type-select]');
  var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!movieCards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var visibleCount = 0;

    movieCards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var matchedType = !type || cardType === type;
      var visible = matchedKeyword && matchedCategory && matchedType;

      card.classList.toggle('hidden-by-filter', !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  [searchInput, categorySelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-src');

    if (!video || !source) {
      return;
    }

    if (shell.getAttribute('data-started') === 'true') {
      video.play().catch(function () {});
      shell.classList.add('is-playing');
      return;
    }

    shell.setAttribute('data-started', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        shell.classList.add('is-ready');
      }, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        shell.classList.add('is-ready');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          shell.classList.remove('is-playing');
        }
      });
      shell._hls = hls;
    } else {
      video.src = source;
    }

    video.play().catch(function () {});
    shell.classList.add('is-playing');
  }

  document.querySelectorAll('[data-video-src]').forEach(function (shell) {
    var overlay = shell.querySelector('.player-overlay');
    var video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (shell.getAttribute('data-started') !== 'true') {
          startPlayer(shell);
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  });
})();
