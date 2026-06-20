function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var mask = document.getElementById("play-mask");
  if (!video || !streamUrl) {
    return;
  }

  var started = false;
  var hlsInstance = null;

  function hideMask() {
    if (mask) {
      mask.classList.add("is-hidden");
    }
  }

  function playVideo() {
    hideMask();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function start() {
    if (started) {
      playVideo();
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
      return;
    }
    if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            video.src = streamUrl;
          }
        }
      });
      return;
    }
    video.src = streamUrl;
    playVideo();
  }

  if (mask) {
    mask.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", hideMask);
}
