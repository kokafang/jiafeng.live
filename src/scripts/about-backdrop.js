export function extendAboutBackdrop(frame) {
  const image = frame?.querySelector(':scope > img');
  if (!image) return;

  const extension = document.createElement('canvas');
  const context = extension.getContext('2d');
  if (!context) return;
  extension.className = 'about-pixel-extension';
  extension.setAttribute('aria-hidden', 'true');
  extension.hidden = true;
  frame.prepend(extension);

  function fit() {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const width = image.clientWidth;
    const height = image.clientHeight;
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const gap = width - renderedWidth;
    extension.hidden = gap < 0.5 || !height;
    if (extension.hidden) return;

    extension.style.left = `${image.offsetLeft}px`;
    extension.style.top = `${image.offsetTop + (height - renderedHeight) / 2}px`;
    // One pixel of overlap prevents a seam from fractional layout rounding.
    extension.style.width = `${gap + 1}px`;
    extension.style.height = `${renderedHeight}px`;
  }

  function sampleEdge() {
    if (!image.naturalWidth || !image.naturalHeight) return;
    extension.width = 1;
    extension.height = image.naturalHeight;
    // Stretch only the leftmost pixel column; the portrait stays in its own image.
    context.drawImage(image, 0, 0, 1, image.naturalHeight, 0, 0, 1, image.naturalHeight);
    fit();
  }

  image.addEventListener('load', sampleEdge);
  new ResizeObserver(fit).observe(image);
  if (image.complete) sampleEdge();
}
