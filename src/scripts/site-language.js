import shows from '../content/shows.json';
import { projectDetails } from '../content/project-details.js';
import { pressItems } from '../content/press.js';
import { createSiteTranslator, staticParagraphsZh } from '../content/site-translations.js';
import '../styles/site-language.css';

export function mountLanguageSwitch({ musicReleases = [] } = {}) {
  const { translate, add } = createSiteTranslator({ shows, projectDetails, pressItems, musicReleases });
  for (const [selector, translations] of Object.entries(staticParagraphsZh)) {
    document.querySelectorAll(selector).forEach((node, index) => add(node.textContent, translations[index]));
  }
  const originalTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const originalDescription = description?.content;
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
  const excluded = 'script, style, svg, .cursor-code-trail, [data-language-toggle], [data-language-status], [data-no-translate]';
  let locale = 'en';
  const buttons = [];
  const status = document.createElement('span');
  status.className = 'language-status';
  status.dataset.languageStatus = '';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  document.body.append(status);

  function toggleButton(host, className = '') {
    if (!host) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-toggle ' + className;
    button.dataset.languageToggle = '';
    button.addEventListener('click', () => setLocale(locale === 'en' ? 'zh-CN' : 'en'));
    host.append(button);
    buttons.push(button);
    return button;
  }
  toggleButton(document.querySelector('.portal-mini-nav'));
  toggleButton(document.querySelector('.portal-top-nav-group:last-child'), 'hero-language-toggle');
  const dialogHeader = document.querySelector('.project-dialog-header');
  const dialogButton = toggleButton(dialogHeader);
  if (dialogButton) dialogHeader.insertBefore(dialogButton, dialogHeader.querySelector('.project-dialog-close'));

  function excludedNode(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !element || Boolean(element.closest(excluded));
  }

  // Remember each original node rather than replacing containers or restarting embeds.
  function translateNode(node) {
    if (excludedNode(node)) return;
    const current = node.nodeValue;
    const previous = textSources.get(node);
    const source = previous && current === previous.output ? previous.source : current;
    const output = translate(source, locale);
    textSources.set(node, { source, output });
    if (output !== current) node.nodeValue = output;
  }

  function translateAttributes(element) {
    if (excludedNode(element)) return;
    let records = attributeSources.get(element);
    if (!records) { records = new Map(); attributeSources.set(element, records); }
    for (const name of attributes) {
      const current = element.getAttribute(name);
      if (current === null) { records.delete(name); continue; }
      const previous = records.get(name);
      const source = previous && current === previous.output ? previous.source : current;
      const output = translate(source, locale);
      records.set(name, { source, output });
      if (current !== output) element.setAttribute(name, output);
    }
  }

  function translateTree(root) {
    if (!root.isConnected || excludedNode(root)) return;
    if (root.nodeType === Node.TEXT_NODE) { translateNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return excludedNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === Node.TEXT_NODE) translateNode(walker.currentNode);
      else translateAttributes(walker.currentNode);
    }
  }

  function setLocale(next) {
    locale = next;
    document.documentElement.lang = locale;
    buttons.forEach(button => {
      button.textContent = locale === 'en' ? '中' : 'ENG';
      button.lang = locale === 'en' ? 'zh-CN' : 'en';
      button.setAttribute('aria-label', locale === 'en' ? '切换为中文' : 'Switch to English');
      button.title = button.getAttribute('aria-label');
    });
    translateTree(document.body);
    document.title = locale === 'en' ? originalTitle : '高嘉丰 Jiafeng · 音乐与创作';
    if (description) description.content = locale === 'en' ? originalDescription : '高嘉丰官方网站：音乐、网页 DJ、创作项目、演出、媒体报道与周边。';
    status.textContent = locale === 'en' ? 'Language: English' : '已切换为中文';
    document.dispatchEvent(new CustomEvent('site:languagechange', { detail: { locale } }));
  }

  setLocale('en');
  // Only new copy and accessible labels are observed; animation styles and inputs are untouched.
  const observer = new MutationObserver(records => {
    const roots = new Set();
    for (const record of records) {
      if (excludedNode(record.target)) continue;
      if (record.type === 'attributes') translateAttributes(record.target);
      else if (record.type === 'characterData') roots.add(record.target);
      else record.addedNodes.forEach(node => roots.add(node));
    }
    roots.forEach(translateTree);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attributes });
  if (import.meta.hot) import.meta.hot.dispose(() => observer.disconnect());
  return { setLocale, getLocale: () => locale };
}
