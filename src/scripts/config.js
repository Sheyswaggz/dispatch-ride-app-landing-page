/**
 * Application Configuration
 * Central configuration file for the dispatch ride app
 */

export const APP_CONFIG = {
  imageOptimization: {
    quality: 0.8,
    maxWidth: 1920,
    formats: ['webp', 'jpg'],
  },
};

/**
 * Animation Configuration
 * Settings for scroll animations and transitions
 */
export const ANIMATION_CONFIG = {
  // IntersectionObserver options
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px',
  
  // Animation timing
  duration: 600,
  delay: 100,
  easing: 'ease-out',
};