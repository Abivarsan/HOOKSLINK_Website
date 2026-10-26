/**
 * HOOKSLINK - Current Year Module
 */

export function setCurrentYear(elements) {
  if (!elements || !elements.length) return;
  const currentYear = new Date().getFullYear();
  elements.forEach((el) => {
    el.textContent = currentYear;
  });
}
