/**
 * Application Configuration
 * Centralized configuration management for the Dispatch Ride landing page
 */

/**
 * Environment detection
 */
const isDevelopment = () => {
  try {
    return process.env.NODE_ENV === 'development';
  } catch {
    return false;
  }
};

const isProduction = () => {
  try {
    return __PROD__ === true;
  } catch {
    return true;
  }
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: isDevelopment()
    ? 'http://localhost:3000/api'
    : 'https://api.dispatchride.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Image Optimization Configuration
 */
export const IMAGE_CONFIG = {
  // Lazy loading settings
  lazyLoad: {
    rootMargin: '50px',
    threshold: 0.01,
    enableNativeLazyLoad: true,
  },

  // Responsive image breakpoints
  breakpoints: {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },

  // Image quality settings
  quality: {
    default: 85,
    thumbnail: 70,
    hero: 90,
  },

  // Supported formats (in order of preference)
  formats: ['webp', 'avif', 'jpg', 'png'],

  // Placeholder settings
  placeholder: {
    enabled: true,
    blur: 10,
    quality: 20,
  },
};

/**
 * Animation Configuration
 */
export const ANIMATION_CONFIG = {
  // Scroll animation settings
  scroll: {
    threshold: 0.1,
    rootMargin: '0px',
    triggerOnce: true,
  },

  // Transition durations (in ms)
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Resource hints
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.dispatchride.com',
  ],

  // Prefetch settings
  prefetch: {
    enabled: true,
    priority: 'low',
  },

  // Service Worker settings
  serviceWorker: {
    enabled: isProduction(),
    scope: '/',
    updateInterval: 3600000, // 1 hour
  },

  // Cache settings
  cache: {
    images: {
      maxAge: 604800, // 1 week
      maxSize: 50, // MB
    },
    static: {
      maxAge: 2592000, // 30 days
    },
  },
};

/**
 * Analytics Configuration
 */
export const ANALYTICS_CONFIG = {
  enabled: isProduction(),
  trackingId: 'UA-XXXXXXXXX-X', // Replace with actual tracking ID
  anonymizeIp: true,
  cookieExpires: 63072000, // 2 years

  // Events to track
  events: {
    downloadClick: 'download_click',
    formSubmit: 'form_submit',
    videoPlay: 'video_play',
    scrollDepth: 'scroll_depth',
  },
};

/**
 * Form Configuration
 */
export const FORM_CONFIG = {
  // Validation settings
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    phone: {
      pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Please enter a valid phone number',
    },
  },

  // Submission settings
  submission: {
    timeout: 10000,
    retryAttempts: 2,
    successMessage: 'Thank you! We\'ll be in touch soon.',
    errorMessage: 'Something went wrong. Please try again.',
  },
};

/**
 * App Store Links
 */
export const APP_LINKS = {
  ios: {
    url: 'https://apps.apple.com/app/dispatch-ride',
    badge: '/src/assets/images/app-store-badge.svg',
  },
  android: {
    url: 'https://play.google.com/store/apps/details?id=com.dispatchride',
    badge: '/src/assets/images/google-play-badge.svg',
  },
};

/**
 * Social Media Links
 */
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/dispatchride',
  twitter: 'https://twitter.com/dispatchride',
  instagram: 'https://instagram.com/dispatchride',
  linkedin: 'https://linkedin.com/company/dispatchride',
};

/**
 * Feature Flags
 */
export const FEATURES = {
  newsletter: true,
  testimonials: true,
  blog: false,
  liveChat: false,
};

/**
 * Development Tools
 */
if (isDevelopment()) {
  // Expose config to window for debugging
  window.__APP_CONFIG__ = {
    API_CONFIG,
    IMAGE_CONFIG,
    ANIMATION_CONFIG,
    PERFORMANCE_CONFIG,
    ANALYTICS_CONFIG,
    FORM_CONFIG,
    APP_LINKS,
    SOCIAL_LINKS,
    FEATURES,
  };

  console.warn('Development mode: App config exposed to window.__APP_CONFIG__');
}

/**
 * Export all configurations
 */
export default {
  API_CONFIG,
  IMAGE_CONFIG,
  ANIMATION_CONFIG,
  PERFORMANCE_CONFIG,
  ANALYTICS_CONFIG,
  FORM_CONFIG,
  APP_LINKS,
  SOCIAL_LINKS,
  FEATURES,
};