/**
 * Configuration Module
 * 
 * Centralized configuration for feature flags, app settings, and environment-specific values.
 * Provides runtime configuration with validation and type safety through JSDoc.
 * 
 * @module config
 * @generated-from task-id:TASK-002 sprint:current
 * @modifies none - new file
 * @dependencies none
 */

/**
 * @typedef {Object} FeatureFlags
 * @property {boolean} hero_section_enabled - Controls visibility of hero section
 */

/**
 * @typedef {Object} AppStoreUrls
 * @property {string} ios - Apple App Store URL (placeholder)
 * @property {string} android - Google Play Store URL (placeholder)
 */

/**
 * @typedef {Object} ImageOptimization
 * @property {boolean} lazyLoading - Enable lazy loading for images
 * @property {string[]} formats - Supported image formats in order of preference
 * @property {number} maxWidth - Maximum image width for responsive images
 */

/**
 * @typedef {Object} PerformanceBudgets
 * @property {number} lcpThreshold - Largest Contentful Paint threshold in seconds
 * @property {number} maxImageSize - Maximum individual image size in KB
 * @property {number} maxHeroWeight - Maximum total hero section weight in KB
 */

/**
 * @typedef {Object} AppConfig
 * @property {FeatureFlags} featureFlags - Feature flag configuration
 * @property {AppStoreUrls} appStoreUrls - App store download URLs
 * @property {ImageOptimization} imageOptimization - Image optimization settings
 * @property {PerformanceBudgets} performanceBudgets - Performance budget thresholds
 * @property {string} environment - Current environment (development/production)
 * @property {boolean} debug - Debug mode flag
 */

/**
 * Validates configuration object structure and values
 * @param {AppConfig} config - Configuration object to validate
 * @throws {Error} If configuration is invalid
 * @returns {void}
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be a valid object');
  }

  if (typeof config.featureFlags?.hero_section_enabled !== 'boolean') {
    throw new Error('featureFlags.hero_section_enabled must be a boolean');
  }

  if (typeof config.appStoreUrls?.ios !== 'string' || !config.appStoreUrls.ios) {
    throw new Error('appStoreUrls.ios must be a non-empty string');
  }

  if (typeof config.appStoreUrls?.android !== 'string' || !config.appStoreUrls.android) {
    throw new Error('appStoreUrls.android must be a non-empty string');
  }

  if (typeof config.imageOptimization?.lazyLoading !== 'boolean') {
    throw new Error('imageOptimization.lazyLoading must be a boolean');
  }

  if (!Array.isArray(config.imageOptimization?.formats) || config.imageOptimization.formats.length === 0) {
    throw new Error('imageOptimization.formats must be a non-empty array');
  }

  if (typeof config.imageOptimization?.maxWidth !== 'number' || config.imageOptimization.maxWidth <= 0) {
    throw new Error('imageOptimization.maxWidth must be a positive number');
  }

  if (typeof config.performanceBudgets?.lcpThreshold !== 'number' || config.performanceBudgets.lcpThreshold <= 0) {
    throw new Error('performanceBudgets.lcpThreshold must be a positive number');
  }

  if (typeof config.performanceBudgets?.maxImageSize !== 'number' || config.performanceBudgets.maxImageSize <= 0) {
    throw new Error('performanceBudgets.maxImageSize must be a positive number');
  }

  if (typeof config.performanceBudgets?.maxHeroWeight !== 'number' || config.performanceBudgets.maxHeroWeight <= 0) {
    throw new Error('performanceBudgets.maxHeroWeight must be a positive number');
  }

  const validEnvironments = ['development', 'production'];
  if (!validEnvironments.includes(config.environment)) {
    throw new Error(`environment must be one of: ${validEnvironments.join(', ')}`);
  }

  if (typeof config.debug !== 'boolean') {
    throw new Error('debug must be a boolean');
  }
}

/**
 * Determines current environment from various sources
 * @returns {string} Current environment (development or production)
 */
function detectEnvironment() {
  // Check Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.MODE === 'production' ? 'production' : 'development';
  }

  // Check Node.js environment variable
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  // Check global __PROD__ flag set by Vite
  if (typeof __PROD__ !== 'undefined') {
    return __PROD__ ? 'production' : 'development';
  }

  // Default to development for safety
  return 'development';
}

/**
 * Application configuration object
 * @type {AppConfig}
 */
const config = {
  /**
   * Feature flags for controlling application features
   */
  featureFlags: {
    /**
     * Controls visibility of hero section
     * Set to false to hide hero section (kill switch)
     */
    hero_section_enabled: true,
  },

  /**
   * App store download URLs
   * These are placeholder URLs to be updated with actual store links
   */
  appStoreUrls: {
    /**
     * Apple App Store URL
     * TODO: Replace with actual App Store URL when available
     */
    ios: 'https://apps.apple.com/app/dispatch-ride',

    /**
     * Google Play Store URL
     * TODO: Replace with actual Play Store URL when available
     */
    android: 'https://play.google.com/store/apps/details?id=com.dispatchride.app',
  },

  /**
   * Image optimization configuration
   */
  imageOptimization: {
    /**
     * Enable lazy loading for images
     * Uses native loading="lazy" attribute
     */
    lazyLoading: true,

    /**
     * Supported image formats in order of preference
     * WebP first for modern browsers, with fallbacks
     */
    formats: ['webp', 'png', 'jpg'],

    /**
     * Maximum image width for responsive images
     * Used for srcset generation
     */
    maxWidth: 1920,
  },

  /**
   * Performance budget thresholds
   * Used for monitoring and alerting
   */
  performanceBudgets: {
    /**
     * Largest Contentful Paint threshold in seconds
     * Target: < 2.5s for good user experience
     */
    lcpThreshold: 2.5,

    /**
     * Maximum individual image size in KB
     * Ensures fast loading on slower connections
     */
    maxImageSize: 200,

    /**
     * Maximum total hero section weight in KB
     * Includes all images and assets
     */
    maxHeroWeight: 500,
  },

  /**
   * Current environment
   * Automatically detected from build system
   */
  environment: detectEnvironment(),

  /**
   * Debug mode flag
   * Enables additional logging and validation in development
   */
  get debug() {
    return this.environment === 'development';
  },
};

// Validate configuration on module load
try {
  validateConfig(config);
} catch (error) {
  console.error('[CONFIG] Configuration validation failed:', error.message);
  throw error;
}

// Log configuration in debug mode
if (config.debug) {
  console.log('[CONFIG] Configuration loaded:', {
    environment: config.environment,
    featureFlags: config.featureFlags,
    debug: config.debug,
  });
}

// Freeze configuration to prevent runtime modifications
Object.freeze(config.featureFlags);
Object.freeze(config.appStoreUrls);
Object.freeze(config.imageOptimization);
Object.freeze(config.imageOptimization.formats);
Object.freeze(config.performanceBudgets);
Object.freeze(config);

/**
 * Get feature flag value
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} Feature flag value
 * @throws {Error} If flag name is invalid
 */
export function getFeatureFlag(flagName) {
  if (typeof flagName !== 'string' || !flagName) {
    throw new Error('Flag name must be a non-empty string');
  }

  if (!(flagName in config.featureFlags)) {
    throw new Error(`Unknown feature flag: ${flagName}`);
  }

  return config.featureFlags[flagName];
}

/**
 * Get app store URL for platform
 * @param {'ios' | 'android'} platform - Platform identifier
 * @returns {string} App store URL
 * @throws {Error} If platform is invalid
 */
export function getAppStoreUrl(platform) {
  const validPlatforms = ['ios', 'android'];
  
  if (!validPlatforms.includes(platform)) {
    throw new Error(`Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`);
  }

  return config.appStoreUrls[platform];
}

/**
 * Check if feature is enabled
 * @param {string} featureName - Name of the feature
 * @returns {boolean} True if feature is enabled
 */
export function isFeatureEnabled(featureName) {
  try {
    return getFeatureFlag(`${featureName}_enabled`);
  } catch {
    return false;
  }
}

/**
 * Get performance budget value
 * @param {string} budgetName - Name of the performance budget
 * @returns {number} Budget value
 * @throws {Error} If budget name is invalid
 */
export function getPerformanceBudget(budgetName) {
  if (typeof budgetName !== 'string' || !budgetName) {
    throw new Error('Budget name must be a non-empty string');
  }

  if (!(budgetName in config.performanceBudgets)) {
    throw new Error(`Unknown performance budget: ${budgetName}`);
  }

  return config.performanceBudgets[budgetName];
}

// Default export
export default config;