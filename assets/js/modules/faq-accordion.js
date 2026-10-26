/**
 * HOOKSLINK - Fluid Animated FAQ Accordion Controller
 */

export function initFaqAccordion(container) {
  if (!container) return;

  const accordions = Array.from(container.querySelectorAll('.faq-item'));

  accordions.forEach(item => {
    const summary = item.querySelector('.faq-item__trigger');
    const content = item.querySelector('.faq-item__content');
    if (!summary || !content) return;

    summary.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close siblings if inside single-expand mode
      if (container.hasAttribute('data-single-expand')) {
        accordions.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.faq-item__trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      if (isOpen) {
        item.classList.remove('is-open');
        summary.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        summary.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
