(function () {
  function loadVideo(video, src) {
    if (!video || !src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video.hlsInstance = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = src;
      video.play().catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-video-overlay]');
    var button = player.querySelector('[data-play-button]');
    var src = player.getAttribute('data-src');

    function start() {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      loadVideo(video, src);
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }
  });
})();
