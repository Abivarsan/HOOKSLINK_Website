/**
 * HOOKSLINK - Card Spotlight Hover Effect (Linear Style)
 */

import { isFinePointer, rafThrottle } from '../utils/motion.js';

export function initSpotlight(cards) {
  if (!cards || !cards.length || !isFinePointer()) return;

  cards.forEach((card) => {
    const onMouseMove = rafThrottle((e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mousemove', onMouseMove, { passive: true });
  });
}
