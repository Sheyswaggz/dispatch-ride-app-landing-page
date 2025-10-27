/**
 * Main JavaScript Entry Point
 * Initializes all interactive features and components
 */

import config from './config.js';
import { initAnimations } from './animations.js';
import { initImageOptimizer } from './image-optimizer.js';

/**
 * Initialize How It Works section based on feature flag
 */
function initHowItWorks() {
  if (!config.how_it_works_enabled) {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.style.display = 'none';
      console.info('[How It Works] Section disabled via feature flag');
    }
    return;
  }

  console.info('[How It Works] Section enabled');
}

/**
 * Initialize footer interactivity
 */
function initFooter() {
  const footer = document.querySelector('footer');
  if (!footer) {
    console.warn('[Footer] Footer element not found');
    return;
  }

  // Add smooth scroll behavior for internal links
  const footerLinks = footer.querySelectorAll('a[href^="#"]');
  footerLinks.forEach((link) => {
    link.addEventListener('click', handleSmoothScroll);
  });

  // Add analytics tracking for footer links
  const allFooterLinks = footer.querySelectorAll('a');
  allFooterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      trackFooterLinkClick(event.currentTarget);
    });
  });

  console.info('[Footer] Initialized with smooth scroll and analytics tracking');
}

/**
 * Handle smooth scroll for internal anchor links
 * @param {Event} event - Click event
 */
function handleSmoothScroll(event) {
  const href = event.currentTarget.getAttribute('href');
  
  // Only handle internal links
  if (!href || !href.startsWith('#')) {
    return;
  }

  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    event.preventDefault();
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // Update URL without triggering navigation
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  }
}

/**
 * Track footer link clicks for analytics
 * @param {HTMLAnchorElement} link - The clicked link element
 */
function trackFooterLinkClick(link) {
  const linkText = link.textContent.trim();
  const linkHref = link.getAttribute('href');
  const linkCategory = link.closest('[data-footer-section]')?.dataset.footerSection || 'unknown';

  // Placeholder for analytics tracking
  // In production, this would send to analytics service
  console.info('[Analytics] Footer link clicked:', {
    text: linkText,
    href: linkHref,
    category: linkCategory,
    timestamp: new Date().toISOString(),
  });

  // Example: Send to analytics service
  // if (window.gtag) {
  //   window.gtag('event', 'footer_link_click', {
  //     link_text: linkText,
  //     link_url: linkHref,
  //     link_category: linkCategory,
  //   });
  // }
}

/**
 * Handle feature flag changes dynamically
 */
function handleFeatureFlagChanges() {
  // Watch for config changes (if implemented via custom events)
  window.addEventListener('config:changed', (event) => {
    const { key, value } = event.detail;
    
    if (key === 'how_it_works_enabled') {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.style.display = value ? '' : 'none';
        console.info(`[How It Works] Feature flag changed to: ${value}`);
      }
    }
  });
}

/**
 * Initialize all components
 */
function init() {
  console.info('[Main] Initializing application...');

  try {
    // Initialize animations
    initAnimations();

    // Initialize image optimizer
    initImageOptimizer();

    // Initialize How It Works section
    initHowItWorks();

    // Initialize footer
    initFooter();

    // Handle feature flag changes
    handleFeatureFlagChanges();

    console.info('[Main] Application initialized successfully');
  } catch (error) {
    console.error('[Main] Initialization error:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing or external use
export { init, initHowItWorks, initFooter, handleSmoothScroll, trackFooterLinkClick };