'use strict';

/**
 * Main JavaScript Entry Point
 * 
 * Production-ready initialization script for Dispatch Ride Landing Page.
 * Handles DOM initialization, event delegation, and core application setup.
 * 
 * @module main
 * @version 1.0.0
 */

/**
 * Application state and configuration
 * @private
 */
const APP_STATE = Object.freeze({
  initialized: false,
  startTime: Date.now(),
  environment: typeof window !== 'undefined' ? 'browser' : 'node',
});

/**
 * Logger utility for structured logging
 * @private
 */
const Logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} [context={}] - Additional context
   */
  info(message, context = {}) {
    console.log('[INFO]', message, {
      timestamp: new Date().toISOString(),
      ...context,
    });
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional context
   */
  warn(message, context = {}) {
    console.warn('[WARN]', message, {
      timestamp: new Date().toISOString(),
      ...context,
    });
  },

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} [error=null] - Error object
   * @param {Object} [context={}] - Additional context
   */
  error(message, error = null, context = {}) {
    console.error('[ERROR]', message, {
      timestamp: new Date().toISOString(),
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : null,
      ...context,
    });
  },

  /**
   * Log debug message (only in development)
   * @param {string} message - Debug message
   * @param {Object} [context={}] - Additional context
   */
  debug(message, context = {}) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.debug('[DEBUG]', message, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  },
};

/**
 * Performance monitoring utility
 * @private
 */
const Performance = {
  /**
   * Mark a performance point
   * @param {string} name - Mark name
   */
  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(name);
      } catch (error) {
        Logger.debug('Performance mark failed', { name, error: error.message });
      }
    }
  },

  /**
   * Measure performance between two marks
   * @param {string} name - Measure name
   * @param {string} startMark - Start mark name
   * @param {string} endMark - End mark name
   * @returns {number|null} Duration in milliseconds
   */
  measure(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure ? measure.duration : null;
      } catch (error) {
        Logger.debug('Performance measure failed', { name, error: error.message });
        return null;
      }
    }
    return null;
  },
};

/**
 * DOM utility functions
 * @private
 */
const DOM = {
  /**
   * Safely query selector
   * @param {string} selector - CSS selector
   * @param {Element} [context=document] - Context element
   * @returns {Element|null} Found element or null
   */
  query(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      Logger.error('Invalid selector', error, { selector });
      return null;
    }
  },

  /**
   * Safely query all elements
   * @param {string} selector - CSS selector
   * @param {Element} [context=document] - Context element
   * @returns {Element[]} Array of found elements
   */
  queryAll(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (error) {
      Logger.error('Invalid selector', error, { selector });
      return [];
    }
  },

  /**
   * Check if DOM is ready
   * @returns {boolean} True if DOM is ready
   */
  isReady() {
    return document.readyState === 'complete' || document.readyState === 'interactive';
  },
};

/**
 * Event delegation handler
 * @private
 */
const EventHandler = {
  /**
   * Registered event listeners for cleanup
   * @private
   */
  _listeners: [],

  /**
   * Add event listener with delegation support
   * @param {Element} element - Target element
   * @param {string} eventType - Event type
   * @param {string|Function} selectorOrHandler - CSS selector or handler function
   * @param {Function} [handler=null] - Handler function if selector provided
   */
  on(element, eventType, selectorOrHandler, handler = null) {
    const isDelegated = typeof selectorOrHandler === 'string';
    const actualHandler = isDelegated ? handler : selectorOrHandler;
    const selector = isDelegated ? selectorOrHandler : null;

    if (!element || !eventType || !actualHandler) {
      Logger.error('Invalid event listener parameters', null, {
        element: !!element,
        eventType,
        handler: !!actualHandler,
      });
      return;
    }

    const wrappedHandler = isDelegated
      ? (event) => {
          const target = event.target.closest(selector);
          if (target && element.contains(target)) {
            actualHandler.call(target, event);
          }
        }
      : actualHandler;

    try {
      element.addEventListener(eventType, wrappedHandler);
      this._listeners.push({ element, eventType, handler: wrappedHandler });
      Logger.debug('Event listener added', { eventType, selector, delegated: isDelegated });
    } catch (error) {
      Logger.error('Failed to add event listener', error, { eventType, selector });
    }
  },

  /**
   * Remove all registered event listeners
   */
  cleanup() {
    this._listeners.forEach(({ element, eventType, handler }) => {
      try {
        element.removeEventListener(eventType, handler);
      } catch (error) {
        Logger.debug('Failed to remove event listener', { error: error.message });
      }
    });
    this._listeners = [];
    Logger.debug('Event listeners cleaned up');
  },
};

/**
 * Initialize application
 * @private
 */
function initializeApp() {
  Performance.mark('app-init-start');

  try {
    Logger.info('Initializing Dispatch Ride Landing Page', {
      environment: APP_STATE.environment,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    });

    // Verify DOM is ready
    if (!DOM.isReady()) {
      Logger.warn('DOM not ready during initialization');
    }

    // Setup global error handler
    setupErrorHandling();

    // Initialize core features
    initializeFeatures();

    // Mark initialization complete
    Object.defineProperty(APP_STATE, 'initialized', {
      value: true,
      writable: false,
    });

    Performance.mark('app-init-end');
    const duration = Performance.measure('app-init', 'app-init-start', 'app-init-end');

    Logger.info('Application initialized successfully', {
      duration: duration ? `${duration.toFixed(2)}ms` : 'N/A',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Application initialization failed', error);
    throw error;
  }
}

/**
 * Setup global error handling
 * @private
 */
function setupErrorHandling() {
  if (typeof window === 'undefined') {
    return;
  }

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    Logger.error('Uncaught error', event.error, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection', event.reason, {
      promise: event.promise,
    });
  });

  Logger.debug('Global error handling configured');
}

/**
 * Initialize core application features
 * @private
 */
function initializeFeatures() {
  Logger.debug('Initializing core features');

  // Feature initialization will be added here as the application grows
  // This provides a clean extension point for future functionality

  // Example: Initialize smooth scrolling
  initializeSmoothScroll();

  Logger.debug('Core features initialized');
}

/**
 * Initialize smooth scrolling for anchor links
 * @private
 */
function initializeSmoothScroll() {
  if (typeof document === 'undefined') {
    return;
  }

  EventHandler.on(document, 'click', 'a[href^="#"]', (event) => {
    const href = event.currentTarget.getAttribute('href');
    
    if (!href || href === '#') {
      return;
    }

    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      event.preventDefault();
      
      try {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        Logger.debug('Smooth scroll triggered', { targetId });
      } catch (error) {
        // Fallback for browsers that don't support smooth scrolling
        targetElement.scrollIntoView();
        Logger.debug('Fallback scroll used', { targetId });
      }
    }
  });

  Logger.debug('Smooth scroll initialized');
}

/**
 * Cleanup function for application teardown
 * @private
 */
function cleanup() {
  Logger.info('Cleaning up application resources');
  
  try {
    EventHandler.cleanup();
    Logger.info('Application cleanup completed');
  } catch (error) {
    Logger.error('Cleanup failed', error);
  }
}

/**
 * Main entry point
 * Initializes the application when DOM is ready
 */
function main() {
  if (typeof document === 'undefined') {
    Logger.warn('Document not available, skipping initialization');
    return;
  }

  if (DOM.isReady()) {
    initializeApp();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initializeApp();
    });
  }

  // Setup cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
  }
}

// Execute main function
main();

// Export for testing and module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Logger,
    Performance,
    DOM,
    EventHandler,
  };
}