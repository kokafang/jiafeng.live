const sections = [
  ...document.querySelectorAll(".portal-stage, .portal-section")
];
const stageSection = document.querySelector(".portal-stage");
const miniNav = document.querySelector(".portal-mini-nav");
const cursorFish = document.querySelector(".cursor-fish");
const cursorTrail = document.querySelector(".cursor-code-trail");
const miniNavLinks = [
  ...document.querySelectorAll("[data-section-link]")
];

function syncViewportHeightVar() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-vh", `${Math.round(viewportHeight)}px`);
}

let currentIndex = 0;
let isAnimating = false;
let animationFrameId = null;
let touchStartY = 0;
let wheelLocked = false;
let touchTriggered = false;
let wheelAccumulatedDelta = 0;
let fishRotation = 0;
let fishTargetRotation = 0;

const codeTokens = [
  "setcpm",
  "lpf",
  "sound",
  "note",
  "stack",
  "slow",
  "fast",
  "gain",
  "room",
  "delay",
  "jux",
  "rev"
];

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function nearestSectionIndex() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const sectionCenter = section.offsetTop + section.offsetHeight / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function updateMiniNav() {
  const section = sections[currentIndex];
  const sectionId = section?.id ?? "";
  const stageHeight = stageSection?.offsetHeight ?? window.innerHeight;
  const showMiniNav = window.scrollY > stageHeight * 0.45;

  if (miniNav) {
    miniNav.classList.toggle("is-visible", showMiniNav);
  }

  miniNavLinks.forEach((link) => {
    link.classList.toggle(
      "is-active",
      link.dataset.sectionLink === sectionId
    );
  });
}

function syncNavigationState() {
  currentIndex = nearestSectionIndex();
  updateMiniNav();
}

function spawnCodeBit(x, y) {
  if (!cursorTrail) return;

  const bit = document.createElement("span");
  bit.className = "code-bit";
  bit.textContent = codeTokens[Math.floor(Math.random() * codeTokens.length)];
  bit.style.left = `${x - 10}px`;
  bit.style.top = `${y + 4}px`;
  cursorTrail.appendChild(bit);

  window.setTimeout(() => {
    bit.remove();
  }, 920);
}

function animateFish() {
  let delta = fishTargetRotation - fishRotation;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  fishRotation += delta * 0.18;

  if (cursorFish) {
    cursorFish.style.transform = `translate3d(var(--fish-x), var(--fish-y), 0) rotate(${fishRotation}deg)`;
  }

  requestAnimationFrame(animateFish);
}

function smoothScrollTo(targetTop, duration = 160, onComplete) {
  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  const startTime = performance.now();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startTop + distance * eased);
    syncNavigationState();

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      animationFrameId = null;
      isAnimating = false;
      syncNavigationState();
      if (onComplete) onComplete();
    }
  }

  animationFrameId = requestAnimationFrame(step);
}

function goToSection(index, options = {}) {
  const { duration = 160 } = options;
  const clampedIndex = Math.max(0, Math.min(index, sections.length - 1));
  const target = sections[clampedIndex];
  if (!target || isAnimating) return;

  currentIndex = clampedIndex;
  updateMiniNav();
  isAnimating = true;
  smoothScrollTo(target.offsetTop, duration);
}

function stepSection(direction) {
  if (isAnimating) return;
  currentIndex = nearestSectionIndex();
  goToSection(currentIndex + direction);
}

function findScrollableParent(target) {
  return target?.closest?.(".music-feature-description, .fill-block");
}

function canScrollWithin(element, deltaY) {
  if (!element) return false;
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 0) return false;
  if (deltaY > 0) return element.scrollTop < maxScrollTop - 1;
  return element.scrollTop > 1;
}

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 2) return;

    const scrollableParent = findScrollableParent(event.target);
    if (canScrollWithin(scrollableParent, event.deltaY)) {
      return;
    }

    event.preventDefault();

    if (isAnimating || wheelLocked) return;

    wheelAccumulatedDelta += event.deltaY;

    if (Math.abs(wheelAccumulatedDelta) < 6) return;

    wheelLocked = true;
    stepSection(wheelAccumulatedDelta > 0 ? 1 : -1);
    wheelAccumulatedDelta = 0;
    window.setTimeout(() => {
      wheelLocked = false;
    }, 16);
  },
  { passive: false }
);

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
    touchTriggered = false;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (isAnimating || touchTriggered) return;

    const touchCurrentY = event.touches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - touchCurrentY;

    if (Math.abs(delta) < 4) return;

    touchTriggered = true;
    stepSection(delta > 0 ? 1 : -1);
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  () => {
    touchTriggered = false;
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  () => {
    wheelAccumulatedDelta = 0;
  },
  { passive: true }
);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    stepSection(1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    stepSection(-1);
  }
});

window.addEventListener("resize", () => {
  syncViewportHeightVar();
  syncNavigationState();
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncViewportHeightVar, {
    passive: true
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (isAnimating) return;
    syncNavigationState();
  },
  { passive: true }
);

document.querySelectorAll('.portal-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId
      ? document.querySelector(targetId)
      : null;

    if (!target) return;

    event.preventDefault();
    const targetIndex = sections.findIndex((section) => section === target);
    if (targetIndex === -1) return;

    goToSection(targetIndex, { duration: 105 });
  });
});

document.querySelectorAll(".video-placeholder").forEach((button) => {
  button.addEventListener("click", () => {
    const videoId = button.dataset.videoId;
    if (!videoId) return;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.title = "YouTube video player";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    button.replaceWith(iframe);
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
    playerHeight: 203,
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
    playerHeight: 469,
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
    playerHeight: 469,
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
    playerHeight: 469,
    description:
      "Emotional Dance Music explores contrast at club scale: softness and impact, romance and rupture, intimacy and volume, all staged through layered electronic production."
  }
];

let activeReleaseIndex = 0;
let musicSwitching = false;
let musicInitialized = false;
let currentPlayerFrame = musicPlayerFrame;

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

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function preloadEmbed(src) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.src = src;
    iframe.onload = () => {
      iframe.remove();
      resolve(true);
    };
    iframe.onerror = () => {
      iframe.remove();
      resolve(false);
    };
    document.body.appendChild(iframe);
    window.setTimeout(() => {
      iframe.remove();
      resolve(false);
    }, 4000);
  });
}

function createPlayerFrame(release) {
  const frame = document.createElement("iframe");
  frame.className = "music-player-frame";
  frame.src = release.embed;
  frame.title = release.playerTitle;
  frame.loading = "lazy";
  frame.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  return frame;
}

function waitForFrame(frame) {
  return new Promise((resolve) => {
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      resolve();
    };
    frame.addEventListener("load", complete, { once: true });
    window.setTimeout(complete, 2600);
  });
}

function applyReleaseCopy(release) {
  musicCover.src = release.cover;
  musicCover.alt = `${release.titleEn} cover`;
  musicTag.textContent = `${release.type} ${release.year}`;
  musicTitleEn.textContent = release.titleEn;
  if (musicDescription && release.description) {
    musicDescription.innerHTML = `<p>${release.description}</p>`;
  }
}

function renderMusicRelease(index) {
  if (
    !musicFeatureCard ||
    !musicCover ||
    !musicTag ||
    !musicTitleEn ||
    !musicPlayerFrame
  ) return;
  if (musicSwitching) return;
  const clamped = Math.max(0, Math.min(index, musicReleases.length - 1));
  if (musicInitialized && clamped === activeReleaseIndex) return;

  musicSwitching = true;
  const release = musicReleases[clamped];

  if (musicFeatureLayout) {
    musicFeatureLayout.classList.add("is-switching");
  }

  const panel = musicFeatureLayout?.querySelector(".album-player-panel");
  const nextFrame = panel ? createPlayerFrame(release) : null;

  if (nextFrame && panel) {
    panel.appendChild(nextFrame);
  }

  Promise.all([
    preloadImage(release.cover),
    nextFrame ? waitForFrame(nextFrame) : preloadEmbed(release.embed)
  ]).finally(() => {
    activeReleaseIndex = clamped;
    applyReleaseCopy(release);

    if (nextFrame) {
      nextFrame.classList.add("is-visible");
      if (currentPlayerFrame && currentPlayerFrame !== nextFrame) {
        const staleFrame = currentPlayerFrame;
        staleFrame.classList.remove("is-visible");
        window.setTimeout(() => {
          staleFrame.remove();
        }, 280);
      }
      currentPlayerFrame = nextFrame;
    }

    if (musicEarlierButton) {
      musicEarlierButton.disabled = activeReleaseIndex >= musicReleases.length - 1;
    }
    if (musicRecentButton) {
      musicRecentButton.disabled = activeReleaseIndex <= 0;
    }

    musicYearButtons.forEach((button) => {
      const year = Number(button.dataset.musicYear);
      button.classList.toggle("is-active", year === release.year);
    });

    if (musicFeatureLayout) {
      musicFeatureLayout.classList.remove("is-switching");
    }
    musicInitialized = true;
    musicSwitching = false;
  });
}

if (musicFeatureCard) {
  if (musicPlayerFrame) {
    musicPlayerFrame.classList.add("music-player-frame", "is-visible");
  }
  renderMusicRelease(0);

  if (musicEarlierButton) {
    musicEarlierButton.addEventListener("click", () => {
      renderMusicRelease(activeReleaseIndex + 1);
    });
  }

  if (musicRecentButton) {
    musicRecentButton.addEventListener("click", () => {
      renderMusicRelease(activeReleaseIndex - 1);
    });
  }

  musicYearButtons.forEach((button) => {
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
  requestAnimationFrame(animateFish);

  let lastBitAt = 0;

  window.addEventListener(
    "mousemove",
    (event) => {
      const fishX = event.clientX - 28;
      const fishY = event.clientY - 10;

      cursorFish.style.setProperty("--fish-x", `${fishX}px`);
      cursorFish.style.setProperty("--fish-y", `${fishY}px`);

      if (event.movementX || event.movementY) {
        fishTargetRotation =
          Math.atan2(event.movementY, event.movementX) * (180 / Math.PI);
      }

      cursorFish.classList.remove("is-hidden");
      cursorTrail.classList.remove("is-hidden");

      const now = performance.now();
      if (now - lastBitAt > 54) {
        spawnCodeBit(event.clientX - 4, event.clientY);
        lastBitAt = now;
      }
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    cursorFish.classList.add("is-hidden");
    cursorTrail.classList.add("is-hidden");
  });
}

syncNavigationState();
syncViewportHeightVar();
