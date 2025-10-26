/**
 * Application configuration
 * Centralized configuration for feature flags and app settings
 */

const config = {
  // Feature flags
  features_section_enabled: true,

  // App settings
  app: {
    name: 'Dispatch Ride',
    version: '1.0.0',
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.dispatchride.com',
    timeout: 30000,
  },

  // Performance settings
  performance: {
    imageOptimization: true,
    lazyLoading: true,
  },
};

export default config;