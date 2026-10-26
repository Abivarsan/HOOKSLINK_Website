/**
 * HOOKSLINK - Animated Number Counters
 */

import { prefersReducedMotion } from '../utils/motion.js';

export function initCounters(counterElements) {
  if (!counterElements || !counterElements.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    counterElements.forEach((el) => {
      el.textContent = el.getAttribute('data-target-value') || el.textContent;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target-value'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = parseInt(el.getAttribute('data-duration'), 10) || 1600;

          if (isNaN(target)) return;

          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * target);

            el.textContent = `${prefix}${current}${suffix}`;

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              el.textContent = `${prefix}${target}${suffix}`;
            }
          };

          window.requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.25 }
  );

  counterElements.forEach((el) => observer.observe(el));
}
