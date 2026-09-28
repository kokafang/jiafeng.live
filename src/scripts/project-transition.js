/** Keep the old project visible until it fades out, and discard superseded requests. */
export function createProjectTransition({ stage, render, reducedMotion }) {
  let animation;
  let generation = 0;
  let requested;
  let rendered;
  let initialized = false;
  let destroyed = false;

  function cancel() {
    generation += 1;
    animation?.cancel();
    animation = null;
  }

  function commit({ value, detail }) {
    render(value, detail);
    rendered = value;
    initialized = true;
  }

  return {
    async show(value, detail = {}) {
      if (destroyed) return;
      const opacity = animation ? Number(stage.ownerDocument.defaultView.getComputedStyle(stage).opacity) : 1;
      cancel();
      const request = { value, detail };
      requested = request;
      if (!initialized || reducedMotion() || !stage.animate || value === rendered) {
        commit(request);
        return;
      }
      const token = generation;
      try {
        animation = stage.animate([{ opacity }, { opacity: 0 }], {
          duration: 350, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards'
        });
        await animation.finished;
        if (token !== generation) return;
        commit(request);
        animation.cancel();
        animation = stage.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards'
        });
        await animation.finished;
        if (token !== generation) return;
        animation.cancel();
        animation = null;
      } catch (error) {
        // Cancelling a Web Animation rejects its finished promise.
        if (token !== generation) return;
        animation?.cancel();
        animation = null;
        if (error.name !== 'AbortError') throw error;
      }
    },
    finish() {
      if (destroyed || !requested) return;
      cancel();
      commit(requested);
    },
    destroy() {
      destroyed = true;
      cancel();
      requested = null;
    }
  };
}
