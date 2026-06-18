
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (box) {
    var input = box.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(box.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(box.querySelectorAll('.movie-card'));
    var empty = box.querySelector('[data-empty-state]');
    var activeFilter = 'all';
    var params = new URLSearchParams(window.location.search);
    var urlQuery = params.get('q');

    if (input && urlQuery) {
      input.value = urlQuery;
    }

    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function (card) {
        var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        var section = card.getAttribute('data-section') || '';
        var matchedText = !query || keywords.indexOf(query) !== -1;
        var matchedFilter = activeFilter === 'all' || section === activeFilter;
        var visible = matchedText && matchedFilter;

        card.classList.toggle('hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });

    apply();
  });
})();

function initPlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('.player-cover');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  var loadStream = function () {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    loaded = true;
  };

  var start = function () {
    loadStream();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    setTimeout(function () {
      var playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }, 80);
  };

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
