const videoReel = [
  { id: "aZPAJyK6yX0", title: "Video 1" },
  { id: "jAKd9Yaiivo", title: "Video 2" },
  { id: "FDt3ksfTm28", title: "Video 3" },
  { id: "cR1rqZ62cW8", title: "Video 4" }

  
];

const videoWrap = document.getElementById('videoCarouselWrap');
const videoTrack = videoWrap.querySelector('.carousel-track');
const videoAutoSpeed = parseFloat(videoWrap.dataset.speed) || 0.6;

const loopedVideos = [...videoReel, ...videoReel, ...videoReel];

loopedVideos.forEach(video => {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-video-item';
  wrapper.dataset.videoId = video.id;
  wrapper.innerHTML = `
    <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}">
    <div class="play-icon">Play</div>
  `;
  videoTrack.appendChild(wrapper);
});

let vPosition = 0;
let vIsDragging = false;
let vHasDragged = false;
let vStartX = 0;
let vStartPosition = 0;
let vOneSetWidth = 0;

function measureVideoSetWidth() {
  vOneSetWidth = videoTrack.scrollWidth / 3;
}
window.addEventListener('load', measureVideoSetWidth);
window.addEventListener('resize', measureVideoSetWidth);

videoWrap.addEventListener('pointerdown', (e) => {
  vIsDragging = true;
  vHasDragged = false;
  vStartX = e.clientX;
  vStartPosition = vPosition;
  videoWrap.classList.add('dragging');
  videoWrap.setPointerCapture(e.pointerId);
});

videoWrap.addEventListener('pointermove', (e) => {
  if (!vIsDragging) return;
  const delta = e.clientX - vStartX;
  if (Math.abs(delta) > 5) vHasDragged = true;
  vPosition = vStartPosition + delta;
});

function endVideoDrag(e) {
  vIsDragging = false;
  videoWrap.classList.remove('dragging');

  if (!vHasDragged) {
    const clicked = document.elementFromPoint(e.clientX, e.clientY);
    const item = clicked && clicked.closest('.carousel-video-item');
    if (item) openVideoLightbox(item.dataset.videoId);
  }
}
videoWrap.addEventListener('pointerup', endVideoDrag);
videoWrap.addEventListener('pointerleave', endVideoDrag);

function updateVideoEffects() {
  const wrapRect = videoWrap.getBoundingClientRect();
  const centerX = wrapRect.left + wrapRect.width / 2;
  const maxDistance = wrapRect.width / 2;

  videoTrack.querySelectorAll('.carousel-video-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(itemCenter - centerX);
    const ratio = Math.min(distance / maxDistance, 1);

    item.style.transform = `scale(${1 - ratio * 0.35})`;
    item.style.opacity = 1 - ratio * 0.75;
  });
}

let videoLightboxOpen = false;

function videoTick() {
  if (!vIsDragging && !videoLightboxOpen) {
    vPosition -= videoAutoSpeed;
  }
  if (vOneSetWidth > 0) {
    if (vPosition <= -vOneSetWidth * 2) vPosition += vOneSetWidth;
    if (vPosition > -vOneSetWidth * 0.5) vPosition -= vOneSetWidth;
  }
  videoTrack.style.transform = `translateX(${vPosition}px)`;
  updateVideoEffects();
  requestAnimationFrame(videoTick);
}
requestAnimationFrame(videoTick);

const videoLightbox = document.getElementById('videoLightbox');
const videoLightboxFrame = document.getElementById('videoLightboxFrame');
const videoLightboxClose = document.getElementById('videoLightboxClose');

function openVideoLightbox(videoId) {
  videoLightboxFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  videoLightbox.classList.add('active');
  videoLightboxOpen = true;
}

function closeVideoLightbox() {
  videoLightboxFrame.src = "";
  videoLightbox.classList.remove('active');
  videoLightboxOpen = false;
}

videoLightboxClose.addEventListener('click', closeVideoLightbox);
videoLightbox.addEventListener('click', (e) => {
  if (e.target === videoLightbox) closeVideoLightbox();
});