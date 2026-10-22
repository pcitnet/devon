(() => {
  'use strict';
  const viewer = document.getElementById('myModal');
  if (!viewer) return;
  const images = Array.from(document.querySelectorAll('.gallery-photo img'));
  const bigImage = viewer.querySelector('#modal-img');
  const caption = viewer.querySelector('#caption');
  const closeBtn = viewer.querySelector('.close');
  const prev = viewer.querySelector('.gallery-previous');
  const next = viewer.querySelector('.gallery-next');
  if (!images.length || !bigImage || !caption || !closeBtn) return;
  let current = 0;
  let lastFocus = null;
  function show(index) {
    current = (index + images.length) % images.length;
    const thumb = images[current];
    bigImage.src = thumb.src.replace('/thumbnails/', '/fullsize/');
    bigImage.alt = thumb.alt;
    caption.textContent = thumb.alt;
  }
  function open(index) {
    lastFocus = document.activeElement;
    viewer.hidden = false;
    viewer.style.display = 'grid';
    show(index);
    closeBtn.focus();
    document.body.classList.add('gallery-open');
  }
  function close() {
    viewer.style.display = 'none';
    viewer.hidden = true;
    bigImage.removeAttribute('src');
    document.body.classList.remove('gallery-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  images.forEach((img,i) => {
    img.tabIndex = 0;
    img.setAttribute('role','button');
    img.setAttribute('aria-label',`View photograph: ${img.alt || (i + 1)}`);
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown',e => { if(e.key === 'Enter' || e.key === ' ') {e.preventDefault();open(i);} });
  });
  closeBtn.addEventListener('click', close);
  prev?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));
  viewer.addEventListener('click', e => { if(e.target === viewer) close(); });
  document.addEventListener('keydown', e => {
    if (viewer.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Tab') {
      const focusable = [closeBtn,prev,next].filter(Boolean);
      const first = focusable[0], last=focusable[focusable.length-1];
      if (e.shiftKey && document.activeElement === first) {e.preventDefault();last.focus();}
      else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first.focus();}
    }
  });
})();
