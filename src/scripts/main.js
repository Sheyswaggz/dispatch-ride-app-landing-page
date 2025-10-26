/**
 * Main Application Entry Point
 * 
 * Initializes the landing page with lazy loading, feature flags, and analytics.
 * Handles hero section initialization with image optimization and download button tracking.
 * 
 * @module main
 * @generated-from task-id:TASK-002 sprint:current
 * @modifies src/scripts/main.js
 * @dependencies config, image-optimizer
 */

import config, { isFeatureEnabled, getAppStoreUrl } from './config.js';
import { initLazyLoading } from './image-optimizer.js';

/**
 * Logger utility for structured logging
 * @private
 */
const logger = {
  info(message, context = {}) {
    if (config.debug) {
      console.info(`[Main] ${message}`, context);
    }
  },
  
  warn(message, context = {}) {
    console.warn(`[Main] ${message}`, context);
  },
  
  error(message, error = {}) {
    console.error(`[Main] ${message}`, error);
  }
};

/**
 * Initialize hero section with lazy loading and feature flag support
 * @returns {Function|null} Cleanup function or null if hero section is disabled
 */
function initHeroSection() {
  // Check feature flag
  if (!isFeatureEnabled('hero_section')) {
    logger.info('Hero section disabled by feature flag');
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.style.display = 'none';
    }
    return null;
  }

  logger.info('Initializing hero section');

  // Initialize lazy loading for hero images
  const heroImages = document.querySelectorAll('.hero [data-src], .hero [data-srcset]');
  
  if (heroImages.length === 0) {
    logger.warn('No hero images found for lazy loading');
    return null;
  }

  const cleanupLazyLoading = initLazyLoading(heroImages, {
    rootMargin: 50,
    threshold: 0.01,
    loadingClass: 'img-loading',
    loadedClass: 'img-loaded',
    errorClass: 'img-error'
  });

  logger.info('Hero section lazy loading initialized', { imageCount: heroImages.length });

  return cleanupLazyLoading;
}

/**
 * Track download button click (analytics placeholder)
 * @param {string} platform - Platform identifier ('ios' or 'android')
 * @param {string} url - Download URL
 */
function trackDownloadClick(platform, url) {
  logger.info('Download button clicked', { platform, url });
  
  // TODO: Replace with actual analytics implementation
  // Example: gtag('event', 'download_click', { platform, url });
  // Example: analytics.track('Download Button Clicked', { platform, url });
  
  if (config.debug) {
    console.log('[Analytics] Download click tracked:', { platform, url, timestamp: new Date().toISOString() });
  }
}

/**
 * Initialize download button event listeners
 * @returns {Function} Cleanup function to remove event listeners
 */
function initDownloadButtons() {
  const downloadButtons = document.querySelectorAll('[data-download-platform]');
  
  if (downloadButtons.length === 0) {
    logger.warn('No download buttons found');
    return () => {};
  }

  const handlers = new Map();

  downloadButtons.forEach(button => {
    const platform = button.getAttribute('data-download-platform');
    
    if (!platform || !['ios', 'android'].includes(platform)) {
      logger.warn('Invalid platform for download button', { platform });
      return;
    }

    try {
      const url = getAppStoreUrl(platform);
      
      // Update button href if it's a link
      if (button.tagName === 'A') {
        button.href = url;
      }

      // Create event handler
      const handler = (event) => {
        trackDownloadClick(platform, url);
        
        // If button is not a link, navigate programmatically
        if (button.tagName !== 'A') {
          event.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      };

      // Store handler for cleanup
      handlers.set(button, handler);

      // Add event listener
      button.addEventListener('click', handler);
      
      logger.info('Download button initialized', { platform, url });
    } catch (error) {
      logger.error('Failed to initialize download button', { platform, error });
    }
  });

  // Return cleanup function
  return () => {
    handlers.forEach((handler, button) => {
      button.removeEventListener('click', handler);
    });
    handlers.clear();
    logger.info('Download button listeners removed');
  };
}

/**
 * Handle feature flag changes (for runtime toggling)
 * @param {string} flagName - Feature flag name
 * @param {boolean} enabled - New flag state
 */
function handleFeatureFlagChange(flagName, enabled) {
  logger.info('Feature flag changed', { flagName, enabled });

  if (flagName === 'hero_section_enabled') {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.style.display = enabled ? '' : 'none';
      logger.info('Hero section visibility updated', { enabled });
    }
  }
}

/**
 * Initialize the application
 * @returns {Function} Cleanup function
 */
function init() {
  logger.info('Application initializing', {
    environment: config.environment,
    debug: config.debug
  });

  const cleanupFunctions = [];

  try {
    // Initialize hero section
    const heroCleanup = initHeroSection();
    if (heroCleanup) {
      cleanupFunctions.push(heroCleanup);
    }

    // Initialize download buttons
    const downloadCleanup = initDownloadButtons();
    cleanupFunctions.push(downloadCleanup);

    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Application initialization failed', error);
    throw error;
  }

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        logger.error('Cleanup function failed', error);
      }
    });
    logger.info('Application cleanup completed');
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing and external use
export { init, initHeroSection, initDownloadButtons, handleFeatureFlagChange, trackDownloadClick };