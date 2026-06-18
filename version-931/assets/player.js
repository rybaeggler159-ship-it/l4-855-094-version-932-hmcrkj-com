(function () {
  function initPlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var start = document.querySelector('[data-player-start]');
    var panel = document.querySelector('[data-player-panel]');
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function play() {
      attach();

      if (panel) {
        panel.classList.add('is-hidden');
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', play);
    }

    if (panel) {
      panel.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        attach();

        if (panel) {
          panel.classList.add('is-hidden');
        }
      });

      video.addEventListener('emptied', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
          hls = null;
        }
        attached = false;
      });
    }
  }

  window.SitePlayer = {
    init: initPlayer
  };
})();
