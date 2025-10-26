/**
 * @fileoverview Scroll-triggered animation utilities using Intersection Observer API
 * @module animations
 * 
 * Provides production-ready scroll animation functionality with:
 * - Multiple animation types (fade-in, slide-up, slide-left, slide-right)
 * - Reduced motion preference support
 * - Performance-optimized Intersection Observer
 * - Configurable thresholds and margins
 * - Graceful degradation for unsupported browsers
 * 
 * @generated-from task-id:TASK-003
 * @modifies None (new file)
 * @dependencies config.js
 */

import { ANIMATION_CONFIG } from './config.js';

/**
 * Animation state tracking
 * @type {WeakMap<Element, IntersectionObserver>}
 */
const observerRegistry = new WeakMap();

/**
 * Global observer instance for performance optimization
 * @type {IntersectionObserver | null}
 */
let globalObserver = null;

/**
 * Tracks if reduced motion is preferred
 * @type {boolean}
 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Supported animation types
 * @enum {string}
 */
const AnimationType = Object.freeze({
  FADE_IN: 'fade-in',
  SLIDE_UP: 'slide-up',
  SLIDE_LEFT: 'slide-left',
  SLIDE_RIGHT: 'slide-right',
  SCALE: 'scale',
  NONE: 'none',
});

/**
 * Default animation configuration
 * @type {Object}
 */
const DEFAULT_CONFIG = Object.freeze({
  threshold: ANIMATION_CONFIG?.scroll?.threshold ?? 0.1,
  rootMargin: ANIMATION_CONFIG?.scroll?.rootMargin ?? '0px',
  triggerOnce: ANIMATION_CONFIG?.scroll?.triggerOnce ?? true,
  animationType: AnimationType.FADE_IN,
  delay: 0,
  duration: ANIMATION_CONFIG?.durations?.normal ?? 300,
});

/**
 * Validates animation configuration
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validated configuration
 * @throws {TypeError} If configuration is invalid
 */
function validateConfig(config) {
  if (config === null || typeof config !== 'object') {
    throw new TypeError('Configuration must be an object');
  }

  const validated = { ...DEFAULT_CONFIG, ...config };

  if (typeof validated.threshold !== 'number' || validated.threshold < 0 || validated.threshold > 1) {
    throw new TypeError('threshold must be a number between 0 and 1');
  }

  if (typeof validated.rootMargin !== 'string') {
    throw new TypeError('rootMargin must be a string');
  }

  if (typeof validated.triggerOnce !== 'boolean') {
    throw new TypeError('triggerOnce must be a boolean');
  }

  if (typeof validated.delay !== 'number' || validated.delay < 0) {
    throw new TypeError('delay must be a non-negative number');
  }

  if (typeof validated.duration !== 'number' || validated.duration < 0) {
    throw new TypeError('duration must be a non-negative number');
  }

  if (!Object.values(AnimationType).includes(validated.animationType)) {
    throw new TypeError(`animationType must be one of: ${Object.values(AnimationType).join(', ')}`);
  }

  return validated;
}

/**
 * Checks if Intersection Observer is supported
 * @returns {boolean} True if supported
 */
function isIntersectionObserverSupported() {
  return (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

/**
 * Applies animation class to element with proper timing
 * @param {Element} element - Target element
 * @param {string} animationType - Type of animation to apply
 * @param {number} delay - Delay before animation starts (ms)
 * @param {number} duration - Animation duration (ms)
 */
function applyAnimation(element, animationType, delay, duration) {
  if (!(element instanceof Element)) {
    console.error('[Animations] Invalid element provided to applyAnimation');
    return;
  }

  // Handle reduced motion preference
  if (prefersReducedMotion) {
    element.classList.add('visible');
    element.style.opacity = '1';
    element.style.transform = 'none';
    return;
  }

  // Set animation duration as CSS variable
  element.style.setProperty('--animation-duration', `${duration}ms`);

  // Apply animation with delay
  if (delay > 0) {
    setTimeout(() => {
      element.classList.add('visible', `animate-${animationType}`);
    }, delay);
  } else {
    element.classList.add('visible', `animate-${animationType}`);
  }
}

/**
 * Removes animation classes from element
 * @param {Element} element - Target element
 */
function removeAnimation(element) {
  if (!(element instanceof Element)) {
    return;
  }

  element.classList.remove('visible');
  
  // Remove all animation type classes
  Object.values(AnimationType).forEach(type => {
    if (type !== AnimationType.NONE) {
      element.classList.remove(`animate-${type}`);
    }
  });

  element.style.removeProperty('--animation-duration');
}

/**
 * Intersection Observer callback handler
 * @param {IntersectionObserverEntry[]} entries - Observed entries
 * @param {IntersectionObserver} observer - Observer instance
 * @param {Object} config - Animation configuration
 */
function handleIntersection(entries, observer, config) {
  entries.forEach(entry => {
    const element = entry.target;
    
    if (entry.isIntersecting) {
      // Element entered viewport
      const animationType = element.dataset.animationType || config.animationType;
      const delay = parseInt(element.dataset.animationDelay, 10) || config.delay;
      const duration = parseInt(element.dataset.animationDuration, 10) || config.duration;

      applyAnimation(element, animationType, delay, duration);

      // Unobserve if triggerOnce is enabled
      if (config.triggerOnce) {
        observer.unobserve(element);
        observerRegistry.delete(element);
      }
    } else if (!config.triggerOnce) {
      // Element left viewport and triggerOnce is false
      removeAnimation(element);
    }
  });
}

/**
 * Creates or retrieves Intersection Observer instance
 * @param {Object} config - Observer configuration
 * @returns {IntersectionObserver} Observer instance
 */
function getObserver(config) {
  // Reuse global observer if configuration matches
  if (globalObserver && 
      globalObserver.thresholds[0] === config.threshold &&
      globalObserver.rootMargin === config.rootMargin) {
    return globalObserver;
  }

  const observerConfig = {
    threshold: config.threshold,
    rootMargin: config.rootMargin,
  };

  const observer = new IntersectionObserver(
    (entries, obs) => handleIntersection(entries, obs, config),
    observerConfig
  );

  // Store as global observer for reuse
  if (!globalObserver) {
    globalObserver = observer;
  }

  return observer;
}

/**
 * Initializes scroll animations for elements
 * @param {string | Element | NodeList | Element[]} selector - Elements to animate
 * @param {Object} [options={}] - Animation configuration options
 * @param {number} [options.threshold=0.1] - Intersection threshold (0-1)
 * @param {string} [options.rootMargin='0px'] - Root margin for intersection
 * @param {boolean} [options.triggerOnce=true] - Trigger animation only once
 * @param {string} [options.animationType='fade-in'] - Type of animation
 * @param {number} [options.delay=0] - Delay before animation (ms)
 * @param {number} [options.duration=300] - Animation duration (ms)
 * @returns {Object} Control object with cleanup method
 * @throws {Error} If selector is invalid or no elements found
 * 
 * @example
 * // Initialize with default options
 * initScrollAnimations('.animate-on-scroll');
 * 
 * @example
 * // Initialize with custom options
 * initScrollAnimations('.feature-card', {
 *   animationType: 'slide-up',
 *   threshold: 0.2,
 *   delay: 100
 * });
 * 
 * @example
 * // Initialize with cleanup
 * const controller = initScrollAnimations('.animate');
 * // Later...
 * controller.cleanup();
 */
export function initScrollAnimations(selector, options = {}) {
  // Validate browser support
  if (!isIntersectionObserverSupported()) {
    console.warn('[Animations] Intersection Observer not supported. Animations disabled.');
    
    // Fallback: make all elements visible immediately
    const elements = getElements(selector);
    elements.forEach(el => {
      el.classList.add('visible');
      el.style.opacity = '1';
    });
    
    return { cleanup: () => {} };
  }

  // Validate and merge configuration
  let config;
  try {
    config = validateConfig(options);
  } catch (error) {
    console.error('[Animations] Invalid configuration:', error.message);
    throw error;
  }

  // Get elements to observe
  const elements = getElements(selector);
  
  if (elements.length === 0) {
    console.warn('[Animations] No elements found for selector:', selector);
    return { cleanup: () => {} };
  }

  // Get or create observer
  const observer = getObserver(config);

  // Observe each element
  elements.forEach(element => {
    // Store observer reference for cleanup
    observerRegistry.set(element, observer);
    
    // Add initial animation class for CSS transitions
    element.classList.add('animate-element');
    
    // Start observing
    observer.observe(element);
  });

  console.info(`[Animations] Initialized scroll animations for ${elements.length} element(s)`);

  // Return control object
  return {
    /**
     * Cleanup function to disconnect observer and remove animations
     */
    cleanup: () => {
      elements.forEach(element => {
        const elementObserver = observerRegistry.get(element);
        if (elementObserver) {
          elementObserver.unobserve(element);
          observerRegistry.delete(element);
        }
        removeAnimation(element);
        element.classList.remove('animate-element');
      });
      
      console.info('[Animations] Cleaned up scroll animations');
    },
  };
}

/**
 * Gets elements from various selector types
 * @param {string | Element | NodeList | Element[]} selector - Element selector
 * @returns {Element[]} Array of elements
 * @throws {TypeError} If selector type is invalid
 */
function getElements(selector) {
  if (typeof selector === 'string') {
    return Array.from(document.querySelectorAll(selector));
  }
  
  if (selector instanceof Element) {
    return [selector];
  }
  
  if (selector instanceof NodeList) {
    return Array.from(selector);
  }
  
  if (Array.isArray(selector)) {
    const allElements = selector.every(el => el instanceof Element);
    if (!allElements) {
      throw new TypeError('Array must contain only Element instances');
    }
    return selector;
  }
  
  throw new TypeError('Selector must be a string, Element, NodeList, or Element array');
}

/**
 * Adds animation to element programmatically
 * @param {Element} element - Target element
 * @param {string} animationType - Type of animation
 * @param {Object} [options={}] - Animation options
 * @returns {void}
 * 
 * @example
 * const element = document.querySelector('.card');
 * addAnimation(element, 'slide-up', { delay: 200 });
 */
export function addAnimation(element, animationType, options = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('First argument must be an Element');
  }

  if (!Object.values(AnimationType).includes(animationType)) {
    throw new TypeError(`Invalid animation type: ${animationType}`);
  }

  const config = validateConfig({ ...DEFAULT_CONFIG, ...options, animationType });
  
  applyAnimation(element, animationType, config.delay, config.duration);
}

/**
 * Removes animation from element
 * @param {Element} element - Target element
 * @returns {void}
 * 
 * @example
 * const element = document.querySelector('.card');
 * removeAnimationFromElement(element);
 */
export function removeAnimationFromElement(element) {
  if (!(element instanceof Element)) {
    throw new TypeError('Argument must be an Element');
  }

  removeAnimation(element);
}

/**
 * Checks if reduced motion is preferred
 * @returns {boolean} True if reduced motion is preferred
 * 
 * @example
 * if (isPrefersReducedMotion()) {
 *   // Skip animations
 * }
 */
export function isPrefersReducedMotion() {
  return prefersReducedMotion;
}

/**
 * Gets available animation types
 * @returns {Object} Animation type enumeration
 * 
 * @example
 * const types = getAnimationTypes();
 * console.log(types.FADE_IN); // 'fade-in'
 */
export function getAnimationTypes() {
  return { ...AnimationType };
}

// Export for testing and advanced usage
export { AnimationType, DEFAULT_CONFIG };