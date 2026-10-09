(function () {
  if (typeof projects === 'undefined') {
    console.warn('gallery.js: no "projects" array found on this page.');
    return;
  }

  const grid = document.getElementById('project-grid');
  if (!grid) {
    console.warn('gallery.js: no #project-grid element found on this page.');
    return;
  }

  // --- Build the cards ---
  projects.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';

    const media = project.type === 'video'
      ? `<video src="${project.src}" autoplay muted loop playsinline></video>`
      : `<img src="${project.src}" alt="${project.name}">`;

    card.innerHTML = `
      ${media}
      <div class="project-card-overlay">
        <h3>${project.name}</h3>
        <p>${project.description}</p>
      </div>
    `;

    card.addEventListener('click', () => openGallery(index));
    grid.appendChild(card);
  });

  // --- Gallery lightbox ---
  const galleryLightbox = document.getElementById('galleryLightbox');
  const galleryMedia = document.getElementById('galleryMedia');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryDescription = document.getElementById('galleryDescription');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryClose = document.getElementById('galleryClose');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');

  let currentProject = null;
  let currentImageIndex = 0;

  function openGallery(projectIndex) {
    currentProject = projects[projectIndex];
    currentImageIndex = 0;
    updateGalleryImage();
    galleryLightbox.classList.add('active');
  }

  // Builds the right element for an item: image, video file, or YouTube
  function buildMedia(item) {
    if (typeof item === 'string') {
      const img = document.createElement('img');
      img.src = item;
      return img;
    }

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      return video;
    }

    if (item.type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1`;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      return iframe;
    }

    const img = document.createElement('img');   // default: image
    img.src = item.src;
    return img;
  }

  function updateGalleryImage() {
    const images = currentProject.gallery;
    const item = images[currentImageIndex];
    const caption = typeof item === 'string' ? '' : (item.caption || '');

    // Clearing the container removes the old element, which also stops any playing video
    galleryMedia.innerHTML = '';
    galleryMedia.appendChild(buildMedia(item));

    galleryTitle.textContent = currentProject.name;
    galleryDescription.textContent = caption || currentProject.description;
    galleryCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;

    const hasMultiple = images.length > 1;
    galleryPrev.style.display = hasMultiple ? 'flex' : 'none';
    galleryNext.style.display = hasMultiple ? 'flex' : 'none';
  }

  function showNextImage() {
    const images = currentProject.gallery;
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateGalleryImage();
  }

  function showPrevImage() {
    const images = currentProject.gallery;
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateGalleryImage();
  }

  function closeGallery() {
    galleryLightbox.classList.remove('active');
    galleryMedia.innerHTML = '';   // removes the element so audio doesn't keep playing
    currentProject = null;
  }

  galleryNext.addEventListener('click', showNextImage);
  galleryPrev.addEventListener('click', showPrevImage);
  galleryClose.addEventListener('click', closeGallery);

  galleryLightbox.addEventListener('click', (e) => {
    if (e.target === galleryLightbox) closeGallery();
  });

  document.addEventListener('keydown', (e) => {
    if (!galleryLightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'Escape') closeGallery();
  });
})();