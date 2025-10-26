/**
 * @fileoverview Main application entry point
 * Initializes all components and handles application lifecycle
 */

import { initImageOptimizer } from './image-optimizer.js';
import { initScrollAnimations } from './animations.js';
import config from './config.js';

/**
 * Initialize application
 */
function init() {
  console.log('Initializing Dispatch Ride Landing Page...');

  // Initialize image optimization
  initImageOptimizer();

  // Initialize features section if enabled
  if (config.features_section_enabled) {
    initFeaturesSection();
  }

  console.log('Application initialized successfully');
}

/**
 * Initialize features section with scroll animations
 */
function initFeaturesSection() {
  try {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.info('[Features] Reduced motion preferred - animations disabled');
      // Make feature cards visible immediately
      const featureCards = document.querySelectorAll('.feature-card');
      featureCards.forEach(card => {
        card.classList.add('visible');
        card.style.opacity = '1';
      });
      return;
    }

    // Initialize scroll animations for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
      initScrollAnimations('.feature-card', {
        animationType: 'fade-in',
        threshold: 0.1,
        triggerOnce: true,
        delay: 0,
        duration: 600
      });

      console.info(`[Features] Initialized scroll animations for ${featureCards.length} feature cards`);
    } else {
      console.warn('[Features] No feature cards found in DOM');
    }
  } catch (error) {
    console.error('[Features] Failed to initialize features section:', error);
    // Fallback: make cards visible
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.classList.add('visible');
      card.style.opacity = '1';
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle feature flag changes (for development/testing)
if (typeof window !== 'undefined') {
  window.toggleFeaturesSection = function(enabled) {
    config.features_section_enabled = enabled;
    const featuresSection = document.querySelector('.features-section');
    
    if (featuresSection) {
      featuresSection.style.display = enabled ? '' : 'none';
      console.info(`[Features] Section ${enabled ? 'enabled' : 'disabled'}`);
    }
  };
}