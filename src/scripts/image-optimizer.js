/**
 * Image Optimizer Utility
 * 
 * Provides lazy loading and responsive image handling with WebP support
 * and fallback mechanisms for browsers without modern image format support.
 * 
 * @module image-optimizer
 * @version 1.0.0
 */

/**
 * Configuration for image optimization
 * @typedef {Object} ImageOptimizerConfig
 * @property {number} rootMargin - Intersection observer root margin in pixels
 * @property {number} threshold - Intersection observer threshold (0-1)
 * @property {string} loadingClass - CSS class for loading state
 * @property {string} loadedClass - CSS class for loaded state
 * @property {string} errorClass - CSS class for error state
 */

/**
 * Default configuration
 * @type {ImageOptimizerConfig}
 */
const DEFAULT_CONFIG = Object.freeze({
  rootMargin: 50,
  threshold: 0.01,
  loadingClass: 'img-loading',
  loadedClass: 'img-loaded',
  errorClass: 'img-error',
});

/**
 * Supported image formats cache
 * @type {Map<string, boolean>}
 */
const formatSupportCache = new Map();

/**
 * Active intersection observers
 * @type {WeakMap<Element, IntersectionObserver>}
 */
const observerRegistry = new WeakMap();

/**
 * Logger utility for structured logging
 * @private
 */
const logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[ImageOptimizer] ${message}`, context);
    }
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[ImageOptimizer] ${message}`, context);
    }
  },

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or context
   */
  error(message, error = {}) {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[ImageOptimizer] ${message}`, error);
    }
  },
};

/**
 * Check if browser supports a specific image format
 * @param {string} format - Image format to check (e.g., 'webp', 'avif')
 * @returns {Promise<boolean>} True if format is supported
 */
async function checkFormatSupport(format) {
  if (typeof format !== 'string' || !format) {
    logger.error('Invalid format parameter', { format });
    return false;
  }

  const normalizedFormat = format.toLowerCase();

  // Return cached result if available
  if (formatSupportCache.has(normalizedFormat)) {
    return formatSupportCache.get(normalizedFormat);
  }

  // Test data URIs for different formats
  const testImages = {
    webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
  };

  const testImage = testImages[normalizedFormat];

  if (!testImage) {
    logger.warn('Unknown image format', { format: normalizedFormat });
    formatSupportCache.set(normalizedFormat, false);
    return false;
  }

  try {
    const supported = await new Promise((resolve) => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img.width === 1 && img.height === 1);
      };

      img.onerror = () => {
        cleanup();
        resolve(false);
      };

      img.src = testImage;
    });

    formatSupportCache.set(normalizedFormat, supported);
    logger.info(`Format support detected: ${normalizedFormat}`, { supported });
    return supported;
  } catch (error) {
    logger.error(`Error checking format support: ${normalizedFormat}`, error);
    formatSupportCache.set(normalizedFormat, false);
    return false;
  }
}

/**
 * Select the best image source from picture element
 * @param {HTMLPictureElement} picture - Picture element
 * @returns {Promise<string|null>} Best image source URL or null
 */
async function selectBestSource(picture) {
  if (!(picture instanceof HTMLPictureElement)) {
    logger.error('Invalid picture element', { picture });
    return null;
  }

  const sources = Array.from(picture.querySelectorAll('source'));
  const img = picture.querySelector('img');

  if (!img) {
    logger.error('No img element found in picture', { picture });
    return null;
  }

  // Check each source in order
  for (const source of sources) {
    const type = source.getAttribute('type');
    
    if (!type) {
      // No type specified, use srcset directly
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        return parseSrcset(srcset);
      }
      continue;
    }

    // Extract format from MIME type (e.g., 'image/webp' -> 'webp')
    const format = type.split('/')[1];
    
    if (format && await checkFormatSupport(format)) {
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        return parseSrcset(srcset);
      }
    }
  }

  // Fallback to img src
  return img.getAttribute('src') || img.getAttribute('data-src');
}

/**
 * Parse srcset attribute and return the most appropriate URL
 * @param {string} srcset - Srcset attribute value
 * @returns {string|null} Selected image URL
 */
function parseSrcset(srcset) {
  if (typeof srcset !== 'string' || !srcset.trim()) {
    return null;
  }

  const candidates = srcset
    .split(',')
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  // Get device pixel ratio
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Parse candidates
  const parsed = candidates.map((candidate) => {
    const parts = candidate.split(/\s+/);
    const url = parts[0];
    const descriptor = parts[1] || '1x';

    let density = 1;
    if (descriptor.endsWith('x')) {
      density = parseFloat(descriptor) || 1;
    } else if (descriptor.endsWith('w')) {
      // For width descriptors, we'll use a simple heuristic
      // In production, you'd want to consider viewport width
      const width = parseFloat(descriptor) || 0;
      density = width / 1000; // Rough approximation
    }

    return { url, density };
  });

  // Sort by density and find the best match
  parsed.sort((a, b) => a.density - b.density);

  // Find the smallest image that's >= device pixel ratio
  const match = parsed.find((candidate) => candidate.density >= dpr);
  
  // If no match found, use the largest available
  return match ? match.url : parsed[parsed.length - 1].url;
}

/**
 * Load an image element
 * @param {HTMLImageElement} img - Image element to load
 * @param {ImageOptimizerConfig} config - Configuration object
 * @returns {Promise<void>}
 */
async function loadImage(img, config) {
  if (!(img instanceof HTMLImageElement)) {
    logger.error('Invalid image element', { img });
    return;
  }

  // Check if already loaded
  if (img.classList.contains(config.loadedClass)) {
    return;
  }

  // Add loading class
  img.classList.add(config.loadingClass);
  img.classList.remove(config.errorClass);

  try {
    let srcToLoad = null;

    // Handle picture element
    const picture = img.closest('picture');
    if (picture) {
      srcToLoad = await selectBestSource(picture);
    }

    // Fallback to data-src or src
    if (!srcToLoad) {
      srcToLoad = img.getAttribute('data-src') || img.getAttribute('src');
    }

    if (!srcToLoad) {
      throw new Error('No image source found');
    }

    // Load the image
    await new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      const cleanup = () => {
        tempImg.onload = null;
        tempImg.onerror = null;
      };

      tempImg.onload = () => {
        cleanup();
        resolve();
      };

      tempImg.onerror = () => {
        cleanup();
        reject(new Error(`Failed to load image: ${srcToLoad}`));
      };

      // Handle srcset if present
      const srcset = img.getAttribute('data-srcset');
      if (srcset) {
        tempImg.srcset = srcset;
      }

      tempImg.src = srcToLoad;
    });

    // Update the actual image
    const srcset = img.getAttribute('data-srcset');
    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }

    img.src = srcToLoad;
    img.removeAttribute('data-src');

    // Update classes
    img.classList.remove(config.loadingClass);
    img.classList.add(config.loadedClass);

    logger.info('Image loaded successfully', { src: srcToLoad });
  } catch (error) {
    img.classList.remove(config.loadingClass);
    img.classList.add(config.errorClass);
    logger.error('Failed to load image', error);
    throw error;
  }
}

/**
 * Initialize lazy loading for images
 * @param {string|NodeList|HTMLElement[]} selector - CSS selector or elements
 * @param {Partial<ImageOptimizerConfig>} userConfig - User configuration
 * @returns {Function} Cleanup function to disconnect observer
 */
function initLazyLoading(selector = '[data-src], [data-srcset]', userConfig = {}) {
  // Merge user config with defaults
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // Validate configuration
  if (typeof config.rootMargin !== 'number' || config.rootMargin < 0) {
    logger.warn('Invalid rootMargin, using default', { rootMargin: config.rootMargin });
    config.rootMargin = DEFAULT_CONFIG.rootMargin;
  }

  if (typeof config.threshold !== 'number' || config.threshold < 0 || config.threshold > 1) {
    logger.warn('Invalid threshold, using default', { threshold: config.threshold });
    config.threshold = DEFAULT_CONFIG.threshold;
  }

  // Get elements
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else if (selector instanceof NodeList || Array.isArray(selector)) {
    elements = selector;
  } else {
    logger.error('Invalid selector parameter', { selector });
    return () => {};
  }

  if (elements.length === 0) {
    logger.info('No elements found for lazy loading', { selector });
    return () => {};
  }

  // Check for Intersection Observer support
  if (typeof IntersectionObserver === 'undefined') {
    logger.warn('IntersectionObserver not supported, loading all images immediately');
    
    // Load all images immediately
    Array.from(elements).forEach((element) => {
      if (element instanceof HTMLImageElement) {
        loadImage(element, config).catch((error) => {
          logger.error('Failed to load image', error);
        });
      }
    });

    return () => {};
  }

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img instanceof HTMLImageElement) {
            loadImage(img, config)
              .then(() => {
                observer.unobserve(img);
                observerRegistry.delete(img);
              })
              .catch((error) => {
                logger.error('Failed to load image', error);
              });
          }
        }
      });
    },
    {
      rootMargin: `${config.rootMargin}px`,
      threshold: config.threshold,
    }
  );

  // Observe all elements
  Array.from(elements).forEach((element) => {
    if (element instanceof HTMLImageElement) {
      observer.observe(element);
      observerRegistry.set(element, observer);
    }
  });

  logger.info('Lazy loading initialized', { 
    elementCount: elements.length,
    config,
  });

  // Return cleanup function
  return () => {
    observer.disconnect();
    logger.info('Lazy loading disconnected');
  };
}

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs to preload
 * @returns {Promise<void[]>} Promise that resolves when all images are loaded
 */
function preloadImages(urls) {
  if (!Array.isArray(urls)) {
    logger.error('Invalid urls parameter, expected array', { urls });
    return Promise.resolve([]);
  }

  const validUrls = urls.filter((url) => typeof url === 'string' && url.trim());

  if (validUrls.length === 0) {
    logger.warn('No valid URLs to preload');
    return Promise.resolve([]);
  }

  logger.info('Preloading images', { count: validUrls.length });

  const promises = validUrls.map((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        logger.info('Image preloaded', { url });
        resolve();
      };

      img.onerror = () => {
        cleanup();
        logger.error('Failed to preload image', { url });
        reject(new Error(`Failed to preload: ${url}`));
      };

      img.src = url;
    });
  });

  return Promise.allSettled(promises);
}

/**
 * Get WebP support status
 * @returns {Promise<boolean>} True if WebP is supported
 */
async function supportsWebP() {
  return checkFormatSupport('webp');
}

/**
 * Get AVIF support status
 * @returns {Promise<boolean>} True if AVIF is supported
 */
async function supportsAVIF() {
  return checkFormatSupport('avif');
}

// Export public API
export {
  initLazyLoading,
  preloadImages,
  supportsWebP,
  supportsAVIF,
  checkFormatSupport,
  selectBestSource,
  loadImage,
};