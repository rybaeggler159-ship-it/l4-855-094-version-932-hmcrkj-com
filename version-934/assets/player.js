import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (wrap) {
  const video = wrap.querySelector('video');
  const button = wrap.querySelector('.play-overlay');
  const stream = wrap.getAttribute('data-stream');
  let loaded = false;
  let hls = null;

  const load = function () {
    if (!video || !stream) {
      return;
    }
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };

  const play = function () {
    load();
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', function () {
      button.classList.add('hidden');
      play();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
