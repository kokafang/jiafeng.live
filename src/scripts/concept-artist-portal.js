const sections = [
  ...document.querySelectorAll(".portal-stage, .portal-section")
];
const stageSection = document.querySelector(".portal-stage");
const miniNav = document.querySelector(".portal-mini-nav");
const miniNavLinks = [
  ...document.querySelectorAll("[data-section-link]")
];

let currentIndex = 0;
let isAnimating = false;
let animationFrameId = null;
let touchStartY = 0;
let wheelLocked = false;
let touchTriggered = false;
let wheelAccumulatedDelta = 0;

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

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 2) return;

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
  syncNavigationState();
});

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

syncNavigationState();
