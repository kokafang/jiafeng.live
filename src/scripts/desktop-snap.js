// Desktop gestures have a short resisted travel before committing to one stop.
export function createDesktopSnap({ sections, enabled, reducedMotion, onNavigate = () => {} }) {
  const threshold = 90;
  const gestureGap = 180;
  let frame = null;
  let idleTimer;
  let lastWheelAt = -Infinity;
  let quietTailMagnitude = Infinity;
  let quietWheelCount = 0;
  let direction = 0;
  let travel = 0;
  let reverseTravel = 0;
  let origin = null;
  let committed = false;
  let destination = null;
  let settleTimer;
  let pointerDown = false;

  function stops() {
    const limit = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const points = sections.map(section => Math.min(section.getBoundingClientRect().top + scrollY, limit));
    return [...new Set(points.map(Math.round))].sort((a, b) => a - b);
  }

  function nearest(y) {
    return stops().reduce((best, point) => Math.abs(point - y) < Math.abs(best - y) ? point : best, 0);
  }

  function stopAnimation() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    destination = null;
  }

  function animateTo(y, duration = 560) {
    onNavigate();
    stopAnimation();
    const from = scrollY;
    const to = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    if (reducedMotion.matches || Math.abs(to - from) < 1) {
      window.scrollTo({ top: to, behavior: 'instant' });
      return;
    }
    destination = to;
    const start = performance.now();
    function tick(now) {
      if (!enabled()) { stopAnimation(); return; }
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
      if (t < 1) frame = requestAnimationFrame(tick);
      else { frame = null; destination = null; }
    }
    frame = requestAnimationFrame(tick);
  }

  function resetGesture() {
    clearTimeout(idleTimer);
    origin = null;
    travel = 0;
    reverseTravel = 0;
    direction = 0;
    committed = false;
    lastWheelAt = -Infinity;
    quietTailMagnitude = Infinity;
    quietWheelCount = 0;
  }

  function cancel() {
    stopAnimation();
    resetGesture();
    clearTimeout(settleTimer);
  }

  function goTo(y) {
    resetGesture();
    // Ignore the tail of a trackpad gesture after a menu/keyboard navigation.
    committed = true;
    lastWheelAt = performance.now();
    animateTo(y);
  }

  function nestedScroller(target) {
    for (let node = target instanceof Element ? target : null;
      node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2) return node;
    }
    return null;
  }

  function adjacent(y, sign) {
    const points = stops();
    return sign > 0
      ? points.find(point => point > y + 2) ?? points.at(-1)
      : points.findLast(point => point < y - 2) ?? 0;
  }

  window.addEventListener('wheel', event => {
    if (!enabled() || event.ctrlKey || event.metaKey || !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const scroller = nestedScroller(event.target);
    if (scroller) {
      const atEdge = (event.deltaY < 0 && scroller.scrollTop <= 0) ||
        (event.deltaY > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1);
      const pageContent = scroller.matches('.portal-section > div');
      // Descriptions never chain. Long page content can advance after reaching its edge.
      if (!pageContent || !atEdge) {
        if (atEdge) event.preventDefault();
        lastWheelAt = performance.now();
        direction = Math.sign(event.deltaY);
        committed = true;
        return;
      }
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    const sign = Math.sign(delta);
    const fresh = now - lastWheelAt > gestureGap;
    const magnitude = Math.abs(delta);
    // A new push can overlap the previous swipe's decaying momentum. Re-arm
    // after a quiet tail and a clear acceleration, never on the tail alone.
    const renewed = !fresh && committed && frame === null && sign === direction &&
      quietWheelCount >= 3 && magnitude >= Math.max(18, quietTailMagnitude * 2.4);
    if (fresh || renewed || sign !== direction) {
      quietWheelCount = 0;
      quietTailMagnitude = Infinity;
    } else if (committed && magnitude <= 18) {
      quietWheelCount += 1;
      if (quietWheelCount >= 3) quietTailMagnitude = Math.min(quietTailMagnitude, magnitude);
    }
    if (frame !== null && committed) {
      lastWheelAt = now;
      if (direction === sign || direction === 0) {
        reverseTravel = 0;
        return;
      }
      // Ignore tiny direction noise, but smoothly reverse a deliberate gesture.
      reverseTravel += Math.abs(delta);
      if (reverseTravel >= threshold * 0.6) {
        const target = adjacent(destination ?? nearest(scrollY), sign);
        direction = sign;
        reverseTravel = 0;
        animateTo(target);
      }
      return;
    }
    if (fresh || renewed || (direction && sign !== direction)) {
      const landing = destination;
      stopAnimation();
      origin = fresh && landing !== null ? landing : nearest(scrollY);
      travel = 0;
      committed = false;
    }
    lastWheelAt = now;
    direction = sign;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!committed && origin !== null) animateTo(origin, 280);
      origin = null;
      travel = 0;
    }, gestureGap);
    if (committed) return;
    if (origin === null) origin = nearest(scrollY);
    travel += Math.abs(delta);
    const target = adjacent(origin, sign);
    if (travel >= threshold) {
      committed = true;
      animateTo(target);
    } else {
      stopAnimation();
      const resistance = reducedMotion.matches ? 0 : Math.min(Math.abs(target - origin), 42 * (1 - Math.exp(-travel / 85)));
      window.scrollTo({ top: origin + sign * resistance, behavior: 'instant' });
    }
  }, { passive: false });

  window.addEventListener('keydown', event => {
    if (!enabled() || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey ||
        event.target.closest?.('input, textarea, select, button, a, [contenteditable="true"], [role="slider"]') || nestedScroller(event.target)) return;
    let target;
    const current = destination ?? nearest(scrollY);
    if (event.key === 'PageDown' || event.key === 'ArrowDown' || (event.key === ' ' && !event.shiftKey)) target = adjacent(current, 1);
    else if (event.key === 'PageUp' || event.key === 'ArrowUp' || event.key === ' ') target = adjacent(current, -1);
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = stops().at(-1);
    else if (event.key === 'Escape') { cancel(); settle(); return; }
    else return;
    event.preventDefault();
    if (!event.repeat) goTo(target);
  });

  // Include scrollbar dragging and browsers without scrollend support.
  function settle() {
    if (enabled() && !pointerDown && frame === null && origin === null) {
      const target = nearest(scrollY);
      if (Math.abs(target - scrollY) > 2) animateTo(target, 280);
    }
  }
  window.addEventListener('scrollend', settle);
  window.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 160);
  }, { passive: true });
  window.addEventListener('pointerdown', () => { pointerDown = true; });
  window.addEventListener('pointerup', () => { pointerDown = false; settle(); });
  window.addEventListener('pointercancel', () => { pointerDown = false; settle(); });
  window.addEventListener('resize', () => { cancel(); settleTimer = setTimeout(settle, 180); }, { passive: true });
  window.addEventListener('blur', () => { pointerDown = false; resetGesture(); settle(); });
  window.addEventListener('pagehide', cancel);
  return { goTo, cancel };
}
