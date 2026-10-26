/**
 * HOOKSLINK - Header Scroll Module
 */

export function initHeader(headerEl) {
  if (!headerEl) return;

  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.position = 'absolute';
  sentinel.style.top = '0';
  sentinel.style.left = '0';
  sentinel.style.width = '1px';
  sentinel.style.height = '16px';
  sentinel.style.pointerEvents = 'none';
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => {
      headerEl.classList.toggle('site-header--scrolled', !entry.isIntersecting);
    },
    { rootMargin: '0px', threshold: 0 }
  );

  observer.observe(sentinel);
}
