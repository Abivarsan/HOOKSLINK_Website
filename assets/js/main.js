/**
 * HOOKSLINK - Main JavaScript Entry Module
 */

import { initHeader } from './modules/header.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initSpotlight } from './modules/spotlight.js';
import { initCounters } from './modules/counter.js';
import { setCurrentYear } from './modules/current-year.js';

// Mark document as JS-enabled for progressive CSS enhancements
document.documentElement.classList.add('js');

// Initialize Global Core Modules
const headerEl = document.querySelector('[data-header]');
if (headerEl) {
  initHeader(headerEl);
  initNav(headerEl);
}

// Reveal animations
const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length) {
  initReveal(revealElements);
}

// Spotlight hover effect on cards
const spotlightCards = document.querySelectorAll('[data-spotlight]');
if (spotlightCards.length) {
  initSpotlight(spotlightCards);
}

// Stats & Metrics Counters
const counters = document.querySelectorAll('[data-target-value]');
if (counters.length) {
  initCounters(counters);
}

// Dynamic Copyright Year
const yearElements = document.querySelectorAll('[data-current-year]');
if (yearElements.length) {
  setCurrentYear(yearElements);
}

// Page-specific lazy initialization: Contact Form
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  import('./modules/contact-form.js').then(({ initContactForm }) => {
    initContactForm(contactForm);
  });
}
