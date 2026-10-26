/**
 * HOOKSLINK - Accessible Mobile Navigation Drawer
 */

export function initNav(headerEl) {
  if (!headerEl) return;

  const toggleBtn = headerEl.querySelector('[data-menu-toggle]');
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (!toggleBtn || !drawer) return;

  let isOpen = false;
  const focusableSelector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function openMenu() {
    isOpen = true;
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus first link in drawer
    const firstFocusable = drawer.querySelector(focusableSelector);
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu() {
    isOpen = false;
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  // Focus trap within drawer
  drawer.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;

    const focusables = Array.from(drawer.querySelectorAll(focusableSelector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Close when clicking a nav link
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen) closeMenu();
    });
  });

  // Close when window resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && isOpen) {
      closeMenu();
    }
  });
}
