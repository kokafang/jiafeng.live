import { createDesktopSnap } from './desktop-snap.js';
import { fitDesktopSections } from './desktop-fit.js';
import { guardPlayerScrolling } from './player-scroll-guard.js';
import { createLiquidNavigation } from './liquid-navigation.js';
import { mountShowsArchive } from './shows-archive.js';

mountShowsArchive();

const sections = [...document.querySelectorAll(".portal-stage, .portal-section")];
const stageSection = document.querySelector(".portal-stage");
const miniNav = document.querySelector(".portal-mini-nav");
const miniNavStrip = document.querySelector(".mini-links");
const miniNavNext = document.querySelector(".mini-nav-next");
const cursorFish = document.querySelector(".cursor-fish");
const cursorTrail = document.querySelector(".cursor-code-trail");
const miniNavLinks = [...document.querySelectorAll("[data-section-link]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const mobilePages = window.matchMedia("(max-width: 900px) and (pointer: coarse)");
const liquidNavigation = createLiquidNavigation({ nav: miniNav, strip: miniNavStrip, reducedMotion });
const playerScroll = guardPlayerScrolling({ mobilePages });
const desktopSnap = createDesktopSnap({
  sections, enabled: () => !mobilePages.matches, reducedMotion,
  onNavigate: playerScroll.guardAll
});
let mobileSectionId = sections.find(section => `#${section.id}` === location.hash)?.id || "top";
let currentIndex = -1;
let sectionTops = [];
let navigationFrame = null;
let fishFrame = null;
let fishRotation = 0;
let fishTargetRotation = 0;
const codeTokens = ["setcpm", "lpf", "sound", "note", "stack", "slow",
  "fast", "gain", "room", "delay", "jux", "rev"];

function updateNavOverflow() {
  if (!miniNavStrip || !miniNavNext) return;
  miniNavNext.disabled = miniNavStrip.scrollWidth - miniNavStrip.clientWidth - miniNavStrip.scrollLeft <= 2;
}

if (miniNavStrip && miniNavNext) {
  miniNavStrip.addEventListener("scroll", updateNavOverflow, { passive: true });
  new ResizeObserver(updateNavOverflow).observe(miniNavStrip);
  document.fonts.ready.then(updateNavOverflow);
  miniNavNext.addEventListener("click", () => {
    miniNavStrip.scrollBy({
      left: Math.max(100, miniNavStrip.clientWidth * 0.7),
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  });
}

function syncNavigationState() {
  navigationFrame = null;
  const marker = window.scrollY + window.innerHeight * 0.3;
  let nextIndex = 0;
  if (mobilePages.matches) {
    nextIndex = sections.findIndex(section => section.id === mobileSectionId);
  } else {
    sectionTops.forEach((top, index) => {
      if (top <= marker) nextIndex = index;
    });
  }
  const showNav = mobilePages.matches || window.scrollY > (stageSection?.offsetHeight ?? window.innerHeight) * 0.6;
  miniNav?.classList.toggle("is-visible", showNav);
  if (miniNav) miniNav.inert = !showNav;
  if (nextIndex === currentIndex) return;
  const firstSelection = currentIndex < 0;
  currentIndex = nextIndex;
  miniNavLinks.forEach((link) => {
    const active = link.dataset.sectionLink === sections[currentIndex]?.id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  liquidNavigation.update({ immediate: firstSelection });
  if (mobilePages.matches) {
    const activeLink = miniNavLinks.find(link => link.classList.contains("is-active"));
    const strip = activeLink?.parentElement;
    if (strip) {
      const linkRect = activeLink.getBoundingClientRect();
      const stripRect = strip.getBoundingClientRect();
      strip.scrollBy({
        left: linkRect.left - stripRect.left - (stripRect.width - linkRect.width) / 2,
        behavior: firstSelection || reducedMotion.matches ? "instant" : "smooth"
      });
    }
  }
}

function showMobileSection(id) {
  const target = sections.find(section => section.id === id);
  if (!target) return;
  const previous = document.querySelector(".is-mobile-active");
  if (previous && previous !== target) {
    previous.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach(frame => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "https://www.youtube.com");
    });
  }
  mobileSectionId = id;
  sections.forEach(section => section.classList.toggle("is-mobile-active", section === target));
  syncNavigationState();
}

function applyPageMode() {
  desktopSnap.cancel();
  const selected = sections[Math.max(0, currentIndex)] || stageSection;
  document.documentElement.classList.toggle("mobile-pages", mobilePages.matches);
  if (mobilePages.matches) {
    showMobileSection(currentIndex < 0 ? mobileSectionId : selected.id);
  } else {
    sections.forEach(section => section.classList.remove("is-mobile-active"));
    if (currentIndex >= 0) selected.scrollIntoView({ behavior: "instant" });
    measureSections();
  }
}

mobilePages.addEventListener("change", applyPageMode);
window.addEventListener("popstate", () => {
  if (mobilePages.matches) showMobileSection(location.hash.slice(1) || "top");
});
window.addEventListener("hashchange", () => {
  if (mobilePages.matches) showMobileSection(location.hash.slice(1) || "top");
});

function measureSections() {
  if (document.documentElement.classList.contains("mobile-pages") !== mobilePages.matches) return;
  sectionTops = sections.map((section) => section.getBoundingClientRect().top + window.scrollY);
  syncNavigationState();
}

window.addEventListener("scroll", () => {
  if (navigationFrame === null) navigationFrame = requestAnimationFrame(syncNavigationState);
}, { passive: true });
window.addEventListener("resize", measureSections, { passive: true });
const sectionResizeObserver = new ResizeObserver(measureSections);
sections.forEach((section) => sectionResizeObserver.observe(section));

if (stageSection) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    stageSection.classList.toggle("is-offscreen", !entry.isIntersecting);
  });
  heroObserver.observe(stageSection);
}

// Mobile switches views; desktop menus share the same animation as wheel snapping.
document.querySelectorAll('.portal-top-nav a[href^="#"], .portal-mini-nav a[href^="#"]')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (mobilePages.matches) {
        showMobileSection(target.id);
        if (location.hash !== link.hash) history.pushState(null, "", link.hash);
        return;
      }
      desktopSnap.goTo(target.getBoundingClientRect().top + window.scrollY);
      history.replaceState(null, "", link.hash);
    });
  });

function spawnCodeBit(x, y) {
  if (!cursorTrail) return;
  const bit = document.createElement("span");
  bit.className = "code-bit";
  bit.textContent = codeTokens[Math.floor(Math.random() * codeTokens.length)];
  bit.style.left = `${x - 10}px`;
  bit.style.top = `${y + 4}px`;
  cursorTrail.appendChild(bit);
  window.setTimeout(() => bit.remove(), 920);
}

function animateFish() {
  let delta = ((fishTargetRotation - fishRotation + 540) % 360) - 180;
  fishRotation += delta * 0.18;
  if (cursorFish) {
    cursorFish.style.transform = `translate3d(var(--fish-x), var(--fish-y), 0) rotate(${fishRotation}deg)`;
  }
  fishFrame = Math.abs(delta) > 0.1 ? requestAnimationFrame(animateFish) : null;
}

document.querySelectorAll(".video-placeholder").forEach((button) => {
  button.addEventListener("click", () => {
    const videoId = button.dataset.videoId;
    if (!videoId) return;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    iframe.title = button.getAttribute("aria-label") || "YouTube video player";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    button.replaceWith(iframe);
    playerScroll.activate(iframe);
    iframe.focus({ preventScroll: true });
  });
});

const musicFeatureCard = document.querySelector("[data-music-feature-card]");
const musicCover = document.querySelector("[data-music-cover]");
const musicTag = document.querySelector("[data-music-tag]");
const musicTitleEn = document.querySelector("[data-music-title-en]");
const musicEarlierButton = document.querySelector("[data-music-earlier]");
const musicRecentButton = document.querySelector("[data-music-recent]");
const musicPlayerFrame = document.querySelector("[data-music-player-frame]");
const musicFeatureLayout = document.querySelector(".music-feature-layout");
const musicPlayerPanel = document.querySelector(".album-player-panel");
const musicDescription = document.querySelector("[data-music-description]");
const musicExternalLink = document.querySelector("[data-music-external]");
const musicBandcampLink = document.querySelector("[data-music-bandcamp]");
const musicYearButtons = [
  ...document.querySelectorAll("[data-music-year]")
];

const musicReleases = [
  {
    id: "ai-ni-ai-dao",
    year: 2021,
    type: "SINGLE",
    titleEn: "AI NI AI DAO 爱你爱到",
    titleZh: "爱你爱到",
    cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02cf90b9f5d8df9408f6b3b128",
    embed: "https://open.spotify.com/embed/playlist/2VFuff3egRtu514eAv76dg?utm_source=generator&theme=0",
    playerTitle: "Spotify playlist player",
    bandcampUrl: "https://jiafeng.bandcamp.com/album/ai-ni-ai-dao",
    description:
      "“AI NI AI DAO” is a deconstructed-pop single that fuses hyperpop, metal, future bass, and punk into a sharp, emotionally intense story about obsessive love and destruction; following the original single and MV, AI NI AI DAO Remixes expands that world through a global collaboration with artists from Berlin, the U.S., Malaysia, and China, including Catnapp, galen tipton, recovery girl, Junior Astronaut, @Shelhiel, GG龙虾, and Jellyeeee, with five reinterpretations released sequentially."
  },
  {
    id: "early-technologies",
    year: 2023,
    type: "ALBUM",
    titleEn: "Early Technologies 早期科技",
    titleZh: "早期科技",
    cover: "/images/zaoqi-keji-cover.jpg",
    embed: "https://open.spotify.com/embed/playlist/2kR91gqLTjewj8HLMme2QP?utm_source=generator&theme=0",
    playerTitle: "Spotify playlist player",
    bandcampUrl: "https://jiafeng.bandcamp.com/album/early-technologies",
    description:
      "Early Technologies imagines social media, autotune, and streaming services as artifacts from another era: awkward, romantic, and a little strange at the same time. Crossing hyperpop, indie rock, metal, and electronics, each track tells a different story about technology and everyday digital life."
  },
  {
    id: "cruel-outlets",
    year: 2021,
    type: "SINGLE",
    titleEn: "Cruel Outlets 残酷奥特莱斯",
    titleZh: "Cruel Outlets",
    cover: "https://f4.bcbits.com/img/a3111630610_5.jpg",
    embed: "https://www.youtube.com/embed/BHZSzilqDZs?list=RDBHZSzilqDZs&start_radio=1",
    playerTitle: "Cruel Outlets video",
    bandcampUrl: "https://jiafeng.bandcamp.com/album/cruel-outlets",
    description:
      "Cruel Outlets extends Jiafeng's deconstructed-pop palette into a sharper emotional register, combining melodic tension and digital abrasion in a tightly controlled song form."
  },
  {
    id: "emotional-dance-music",
    year: 2020,
    type: "ALBUM",
    titleEn: "Emotional Dance Music 幻爱锐舞会",
    titleZh: "幻爱锐舞会",
    cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02dc9fc175ce8efb7641be3164",
    embed: "https://open.spotify.com/embed/album/4K8Ia3jfNXhZ5n29Iyua6y?utm_source=oembed&theme=0",
    playerTitle: "Spotify album player",
    bandcampUrl: "https://jiafeng.bandcamp.com/album/emotional-dance-music",
    description:
      "Emotional Dance Music explores contrast at club scale: softness and impact, romance and rupture, intimacy and volume, all staged through layered electronic production."
  }
].sort((a, b) => b.year - a.year);

let activeReleaseIndex = 0;
let requestedReleaseIndex = 0;
let pendingMusicSwitch = null;
let currentPlayerFrame = musicPlayerFrame;
const musicStatus = document.createElement("span");
musicStatus.className = "music-load-status";
musicStatus.setAttribute("role", "status");
musicStatus.setAttribute("aria-live", "polite");
document.querySelector(".music-browse-bar")?.appendChild(musicStatus);

function releaseIndexForYear(year) {
  const exact = musicReleases.findIndex((release) => release.year === year);
  if (exact !== -1) return exact;
  const fallback = musicReleases.findIndex((release) => release.year < year);
  if (fallback !== -1) return fallback;
  return musicReleases.length - 1;
}

function releaseIndexForId(id) {
  if (!id) return -1;
  return musicReleases.findIndex((release) => release.id === id);
}

function preloadImage(src, signal) {
  return new Promise((resolve) => {
    const img = new Image();
    const complete = () => {
      clearTimeout(timeout);
      img.onload = img.onerror = null;
      signal.removeEventListener("abort", complete);
      resolve();
    };
    const timeout = setTimeout(complete, 2600);
    img.onload = img.onerror = complete;
    signal.addEventListener("abort", complete, { once: true });
    img.src = src;
  });
}

function createPlayerFrame(release) {
  const frame = document.createElement("iframe");
  frame.className = "music-player-frame";
  frame.src = release.embed;
  if (release.embed.startsWith("https://www.youtube.com/embed/")) {
    const url = new URL(release.embed);
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("origin", location.origin);
    frame.src = url.href;
  }
  frame.title = release.playerTitle;
  frame.loading = "eager";
  frame.inert = true;
  frame.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  return frame;
}

function waitForFrame(frame, signal) {
  return new Promise((resolve) => {
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      frame.removeEventListener("load", complete);
      signal.removeEventListener("abort", complete);
      resolve();
    };
    frame.addEventListener("load", complete, { once: true });
    const timeout = window.setTimeout(complete, 2600);
    signal.addEventListener("abort", complete, { once: true });
  });
}

function applyReleaseCopy(release) {
  musicCover.src = release.cover;
  musicCover.alt = `${release.titleEn} cover`;
  musicTag.textContent = `${release.type} ${release.year}`;
  musicTitleEn.textContent = release.titleEn;
  const source = new URL(release.embed);
  const isVideo = source.hostname === "www.youtube.com";
  if (musicFeatureLayout) musicFeatureLayout.dataset.playerKind = isVideo ? "video" : "audio";
  if (musicExternalLink) {
    musicExternalLink.href = isVideo
      ? `https://www.youtube.com/watch?v=${source.pathname.split("/").at(-1)}`
      : `${source.origin}${source.pathname.replace("/embed/", "/")}`;
    musicExternalLink.textContent = `${isVideo ? "Open YouTube" : "Open Spotify"} \u2197`;
    musicExternalLink.setAttribute("aria-label", `Open ${release.titleEn} on ${isVideo ? "YouTube" : "Spotify"} (new tab)`);
  }
  if (musicBandcampLink) musicBandcampLink.href = release.bandcampUrl;
  if (musicDescription && release.description) {
    musicDescription.innerHTML = `<p>${release.description}</p>`;
    musicDescription.scrollTop = 0;
  }
}

function updateReleaseControls(index) {
  if (musicEarlierButton) musicEarlierButton.disabled = index >= musicReleases.length - 1;
  if (musicRecentButton) musicRecentButton.disabled = index <= 0;
  musicYearButtons.forEach(button => {
    const active = button.dataset.musicRelease === musicReleases[activeReleaseIndex].id;
    const pending = pendingMusicSwitch && button.dataset.musicRelease === musicReleases[index].id;
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-pending", Boolean(pending));
    button.setAttribute("aria-pressed", String(active));
  });
}

async function renderMusicRelease(index) {
  if (
    !musicFeatureCard ||
    !musicCover ||
    !musicTag ||
    !musicTitleEn ||
    !musicPlayerFrame
  ) return;
  const clamped = Math.max(0, Math.min(index, musicReleases.length - 1));
  if (pendingMusicSwitch && clamped === requestedReleaseIndex) return;
  pendingMusicSwitch?.controller.abort();
  pendingMusicSwitch?.frame.remove();
  pendingMusicSwitch = null;
  requestedReleaseIndex = clamped;
  if (clamped === activeReleaseIndex) {
    musicStatus.textContent = "";
    musicFeatureLayout?.setAttribute("aria-busy", "false");
    updateReleaseControls(clamped);
    return;
  }
  const release = musicReleases[clamped];
  if (!musicPlayerPanel) return;
  const controller = new AbortController();
  const nextFrame = createPlayerFrame(release);
  pendingMusicSwitch = { controller, frame: nextFrame };
  musicStatus.textContent = `Loading ${release.titleEn}...`;
  musicFeatureLayout?.setAttribute("aria-busy", "true");
  updateReleaseControls(clamped);
  const frameReady = waitForFrame(nextFrame, controller.signal);
  musicPlayerPanel.appendChild(nextFrame);
  await Promise.all([preloadImage(release.cover, controller.signal), frameReady]);
  // A newer click owns the transition; cancelled loads must never replace it.
  if (controller.signal.aborted) return;
  activeReleaseIndex = clamped;
  applyReleaseCopy(release);
  nextFrame.classList.add("is-visible");
  nextFrame.inert = false;
  if (currentPlayerFrame && currentPlayerFrame !== nextFrame) {
    const staleFrame = currentPlayerFrame;
    staleFrame.inert = true;
    staleFrame.classList.remove("is-visible");
    window.setTimeout(() => staleFrame.remove(), 280);
  }
  currentPlayerFrame = nextFrame;
  pendingMusicSwitch = null;
  musicFeatureLayout?.setAttribute("aria-busy", "false");
  musicStatus.textContent = "";
  updateReleaseControls(activeReleaseIndex);
}

if (musicFeatureCard) {
  if (musicPlayerFrame) {
    musicPlayerFrame.classList.add("music-player-frame", "is-visible");
  }
  applyReleaseCopy(musicReleases[0]);
  updateReleaseControls(0);

  if (musicEarlierButton) {
    musicEarlierButton.addEventListener("click", () => {
      renderMusicRelease(requestedReleaseIndex + 1);
    });
  }

  if (musicRecentButton) {
    musicRecentButton.addEventListener("click", () => {
      renderMusicRelease(requestedReleaseIndex - 1);
    });
  }

  musicYearButtons.forEach((button) => {
    const release = musicReleases.find(item => item.id === button.dataset.musicRelease);
    if (release) {
      button.title = release.titleEn;
      button.setAttribute("aria-label", `${release.year}: ${release.titleEn}`);
    }
    button.addEventListener("click", () => {
      const releaseId = button.dataset.musicRelease;
      const idIndex = releaseIndexForId(releaseId);
      if (idIndex !== -1) {
        renderMusicRelease(idIndex);
        return;
      }
      const year = Number(button.dataset.musicYear);
      renderMusicRelease(releaseIndexForYear(year));
    });
  });
}

if (cursorFish && cursorTrail) {
  let lastBitAt = 0;
  function hideFish() {
    document.documentElement.classList.remove("fish-enabled");
    cursorFish.classList.add("is-hidden");
    cursorTrail.classList.add("is-hidden");
    cursorTrail.replaceChildren();
    if (fishFrame !== null) cancelAnimationFrame(fishFrame);
    fishFrame = null;
  }
  finePointer.addEventListener("change", hideFish);
  reducedMotion.addEventListener("change", hideFish);
  window.addEventListener("blur", hideFish);
  document.documentElement.addEventListener("pointerleave", hideFish);
  document.addEventListener("pointerover", event => {
    if (event.target instanceof HTMLIFrameElement) hideFish();
  });
  window.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType !== "mouse" || event.target instanceof HTMLIFrameElement) {
      hideFish();
      return;
    }
    document.documentElement.classList.add("fish-enabled");
    cursorFish.style.setProperty("--fish-x", `${event.clientX - 28}px`);
    cursorFish.style.setProperty("--fish-y", `${event.clientY - 10}px`);
    if (event.movementX || event.movementY) {
      fishTargetRotation = Math.atan2(event.movementY, event.movementX) * (180 / Math.PI);
    }
    cursorFish.classList.remove("is-hidden");
    cursorTrail.classList.remove("is-hidden");
    if (fishFrame === null) fishFrame = requestAnimationFrame(animateFish);
    if (performance.now() - lastBitAt > 70) {
      spawnCodeBit(event.clientX - 4, event.clientY);
      lastBitAt = performance.now();
    }
  }, { passive: true });
}

applyPageMode();
measureSections();
fitDesktopSections({ sections, mobilePages });
