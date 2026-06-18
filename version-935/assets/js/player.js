(function () {
    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = document.querySelector('[data-role="movie-video"]');
        var overlay = document.querySelector('[data-role="play-overlay"]');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !overlay || !source) {
            return;
        }

        function attachNative() {
            video.src = source;
            loaded = true;
            return Promise.resolve();
        }

        function attachHls() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                return attachNative();
            }

            return loadHlsLibrary().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                    return;
                }

                return attachNative();
            }).catch(function () {
                return attachNative();
            });
        }

        function startPlayback() {
            var ready = loaded ? Promise.resolve() : attachHls();

            ready.then(function () {
                overlay.classList.add('is-hidden');
                video.controls = true;
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            });
        }

        overlay.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (!loaded) {
                startPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
