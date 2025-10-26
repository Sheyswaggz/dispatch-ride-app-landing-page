/**
 * Main application entry point
 * Initializes all features and handles application lifecycle
 */

import { initImageOptimizer } from './image-optimizer.js';
import { initScrollAnimations } from './animations.js';
import { APP_CONFIG } from './config.js';

/**
 * Initialize all application features
 */
function initApp() {
  // Initialize image optimization
  initImageOptimizer();

  // Initialize scroll animations
  initScrollAnimations();

  // Log initialization
  if (process.env.NODE_ENV === 'development') {
    console.log('App initialized successfully');
    console.log('Image optimization config:', APP_CONFIG.imageOptimization);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations or heavy operations when page is hidden
    console.log('Page hidden - pausing operations');
  } else {
    // Resume operations when page is visible
    console.log('Page visible - resuming operations');
  }
});