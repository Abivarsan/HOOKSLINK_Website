/**
 * HOOKSLINK - Scroll Reveal Module
 */

import { prefersReducedMotion } from '../utils/motion.js';

export function initReveal(elements) {
  if (!elements || !elements.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    }
  );

  elements.forEach((el) => observer.observe(el));
}
