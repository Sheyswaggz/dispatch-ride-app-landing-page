/**
 * Main application entry point
 * Initializes all components and handles application lifecycle
 */

import { config } from './config.js';
import { initAnimations } from './animations.js';
import { initImageOptimizer } from './image-optimizer.js';

/**
 * Initialize the application
 */
function initApp() {
  // Initialize animations
  initAnimations();

  // Initialize image optimizer
  initImageOptimizer();

  // Initialize smooth scrolling for navigation links
  initSmoothScrolling();

  // Initialize mobile menu
  initMobileMenu();

  // Initialize footer year
  initFooterYear();

  // Log initialization if in development mode
  if (config.isDevelopment) {
    console.log('Dispatch Ride App initialized');
  }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }
}

/**
 * Initialize footer year
 */
function initFooterYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}