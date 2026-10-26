/**
 * HOOKSLINK - DOM Utilities
 */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export function on(target, type, callback, options = {}) {
  if (!target) return;
  target.addEventListener(type, callback, options);
}
