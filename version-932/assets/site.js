(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.classList.toggle('active', thumbIndex === currentSlide);
        });
    }

    function startSlides() {
        if (slideTimer) {
            clearInterval(slideTimer);
        }
        slideTimer = setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    if (slides.length) {
        showSlide(0);
        startSlides();
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                showSlide(index);
                startSlides();
            });
        });
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterForms.forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('[data-empty-state]');

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var okType = !typeValue || card.getAttribute('data-type') === typeValue;
                var show = okKeyword && okYear && okType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        [input, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-player-overlay]');

    if (!video || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    }

    function start() {
        if (!video.dataset.ready) {
            bindSource();
            video.dataset.ready = '1';
        }

        if (overlay) {
            overlay.classList.add('hidden');
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
}
