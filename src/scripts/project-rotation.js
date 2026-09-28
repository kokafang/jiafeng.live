/** A visibility-aware clock; the UI owns the reasons playback is paused. */
export function createProjectRotation({ count, onChange, interval = 5000 }) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('Project count must be a positive integer.');
  }
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new RangeError('Rotation interval must be a positive number.');
  }
  if (typeof onChange !== 'function') {
    throw new TypeError('Project rotation requires an onChange callback.');
  }

  let index = 0;
  let active = false;
  let destroyed = false;
  let timer = null;
  const pauseReasons = new Set();
  const canRun = () => !destroyed && active && pauseReasons.size === 0;
  const getState = () => ({
    index,
    active,
    paused: pauseReasons.size > 0,
    running: canRun(),
  });

  function cancel() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    if (!canRun() || timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      if (!canRun()) return;
      index = (index + 1) % count;
      try {
        onChange(index, { automatic: true });
      } finally {
        schedule();
      }
    }, interval);
  }

  return {
    select(nextIndex) {
      if (destroyed || !Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= count) {
        return getState();
      }
      cancel();
      index = nextIndex;
      try {
        onChange(index, { automatic: false });
      } finally {
        schedule();
      }
      return getState();
    },
    setActive(value) {
      const nextActive = Boolean(value);
      if (destroyed || nextActive === active) return getState();
      active = nextActive;
      cancel();
      schedule();
      return getState();
    },
    setPaused(reason, value) {
      const nextPaused = Boolean(value);
      if (destroyed || pauseReasons.has(reason) === nextPaused) return getState();
      if (nextPaused) pauseReasons.add(reason);
      else pauseReasons.delete(reason);
      cancel();
      schedule();
      return getState();
    },
    getState,
    destroy() {
      destroyed = true;
      active = false;
      cancel();
    },
  };
}
