/**
 * HOOKSLINK - Main JavaScript Entry Module (V3 Enhanced)
 */

import { initHeader } from './modules/header.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initSpotlight } from './modules/spotlight.js';
import { initCounters } from './modules/counter.js';
import { setCurrentYear } from './modules/current-year.js';
import { initScrollProgress } from './modules/scroll-progress.js';

// Mark document as JS-enabled for progressive CSS enhancements
document.documentElement.classList.add('js');

// 1. Reading Progress & Back-to-Top
initScrollProgress();

// 2. Initialize Header & Navigation
const headerEl = document.querySelector('[data-header]');
if (headerEl) {
  initHeader(headerEl);
  initNav(headerEl);
}

// 3. Reveal Animations
const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length) {
  initReveal(revealElements);
}

// 4. Spotlight Hover Effect on Cards
const spotlightCards = document.querySelectorAll('[data-spotlight]');
if (spotlightCards.length) {
  initSpotlight(spotlightCards);
}

// 5. Stats & Metrics Counters
const counters = document.querySelectorAll('[data-target-value]');
if (counters.length) {
  initCounters(counters);
}

// 6. Dynamic Copyright Year
const yearElements = document.querySelectorAll('[data-current-year]');
if (yearElements.length) {
  setCurrentYear(yearElements);
}

// 7. Interactive Service Stage Switcher
const stageTabsContainers = document.querySelectorAll('[data-stage-tabs]');
if (stageTabsContainers.length) {
  import('./modules/stage-tabs.js').then(({ initStageTabs }) => {
    stageTabsContainers.forEach(container => initStageTabs(container));
  });
}

// 8. Interactive AI Growth ROI Calculator
const roiWidgets = document.querySelectorAll('[data-roi-widget]');
if (roiWidgets.length) {
  import('./modules/roi-calculator.js').then(({ initRoiCalculator }) => {
    roiWidgets.forEach(widget => initRoiCalculator(widget));
  });
}

// 9. FAQ Accordions
const faqContainers = document.querySelectorAll('[data-faq-accordion]');
if (faqContainers.length) {
  import('./modules/faq-accordion.js').then(({ initFaqAccordion }) => {
    faqContainers.forEach(container => initFaqAccordion(container));
  });
}

// 10. Contact Form Validation
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  import('./modules/contact-form.js').then(({ initContactForm }) => {
    initContactForm(contactForm);
  });
}

// 11. Dual-Loop Continuous Water Flow Engine
const fluidLoops = document.querySelectorAll('[data-fluid-loop]');
if (fluidLoops.length) {
  import('./modules/fluid-loop.js').then(({ initFluidLoop }) => {
    fluidLoops.forEach(el => initFluidLoop(el));
  });
}

// 12. 3D Cylindrical Ribbon Infinite Ticker
const cylinderTickers = document.querySelectorAll('[data-cylinder-ticker]');
if (cylinderTickers.length) {
  import('./modules/cylinder-ticker.js').then(({ initCylinderTicker }) => {
    cylinderTickers.forEach(el => initCylinderTicker(el));
  });
}
