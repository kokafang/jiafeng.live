export function mountAvsProjectLink({ card, isDevelopment, href }) {
  if (!card || !isDevelopment) return null;

  const link = card.ownerDocument.createElement('a');
  link.className = 'project-link-card avs-project-link';
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Open AVS Sampler development site (new tab)');
  link.append(...card.childNodes);
  card.append(link);
  return link;
}
