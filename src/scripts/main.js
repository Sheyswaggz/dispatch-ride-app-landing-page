/**
 * Main application entry point
 * Initializes all interactive features and optimizations
 *
 * @module main
 * @requires ./config
 * @requires ./image-optimizer
 *
 * @description
 * Coordinates application initialization including lazy loading and app store links
 */

import config from './config.js';
import { initLazyLoading } from './image-optimizer.js';

/**
 * Initialize application
 * Sets up lazy loading and configures app store download buttons
 */
function initApp() {
  // Initialize lazy loading for images
  if (config.isFeatureEnabled('lazyLoading')) {
    console.warn('[App] Initializing lazy loading...');
    initLazyLoading();
  }

  // Setup app store buttons
  setupAppStoreButtons();

  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';
}

/**
 * Configure app store download buttons with proper URLs
 * Handles both iOS App Store and Google Play Store links
 */
function setupAppStoreButtons() {
  const appStoreBtn = document.querySelector('.app-store-btn');
  const playStoreBtn = document.querySelector('.play-store-btn');

  if (appStoreBtn) {
    appStoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = config.getAppStoreUrl('ios');
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('[App] iOS App Store URL not configured');
      }
    });
  }

  if (playStoreBtn) {
    playStoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = config.getAppStoreUrl('android');
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('[App] Google Play Store URL not configured');
      }
    });
  }
}

/**
 * Handle page visibility changes
 * Pauses/resumes animations when page is hidden/visible
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Pause animations when page is hidden
    document.body.classList.add('page-hidden');
  } else {
    // Resume animations when page is visible
    document.body.classList.remove('page-hidden');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Handle page visibility
document.addEventListener('visibilitychange', handleVisibilityChange);

// Log initialization in development
if (config.isFeatureEnabled('analytics')) {
  console.warn('[App] Application initialized successfully');
}