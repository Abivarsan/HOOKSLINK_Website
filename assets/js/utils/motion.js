/**
 * HOOKSLINK - Motion Utilities
 */

export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const isFinePointer = () => {
  return window.matchMedia('(pointer: fine)').matches;
};

export function rafThrottle(fn) {
  let running = false;
  return function (...args) {
    if (running) return;
    running = true;
    requestAnimationFrame(() => {
      fn.apply(this, args);
      running = false;
    });
  };
}
