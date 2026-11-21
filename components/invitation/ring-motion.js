/** Mount once per rings element. Returns replay(), setPaused(), and destroy(). */
export function mountWeddingRings(element) {
  if (!element) return null;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let paused = false;
  let destroyed = false;
  const update = () => {
    if (destroyed) return;
    element.classList.toggle('is-visible', inView && !document.hidden);
    element.classList.toggle('is-paused', paused);
  };
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      update();
    }, { threshold: 0.2 })
    : null;
  if (observer) observer.observe(element);
  else { inView = true; update(); }
  document.addEventListener('visibilitychange', update);
  return {
    replay() {
      if (destroyed || motionQuery.matches) return;
      element.querySelectorAll('.wedding-rings__art, .wedding-rings__twinkle')
        .forEach(node => node.getAnimations().forEach(animation => { animation.currentTime = 0; }));
    },
    setPaused(value) { paused = Boolean(value); update(); },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
      element.classList.remove('is-visible', 'is-paused');
    }
  };
}
