/**
 * Application Configuration
 * Central configuration file for the Dispatch Ride App landing page
 */

/**
 * Main application configuration
 */
export const APP_CONFIG = {
  name: 'Dispatch Ride',
  version: '1.0.0',
  description: 'Your reliable ride-hailing service',
  contact: {
    email: 'support@dispatchride.com',
    phone: '+1 (555) 123-4567',
  },
  social: {
    facebook: 'https://facebook.com/dispatchride',
    twitter: 'https://twitter.com/dispatchride',
    instagram: 'https://instagram.com/dispatchride',
    linkedin: 'https://linkedin.com/company/dispatchride',
  },
};

/**
 * Social media links configuration
 */
export const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/dispatchride',
    icon: 'facebook-icon.svg',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/dispatchride',
    icon: 'twitter-icon.svg',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/dispatchride',
    icon: 'instagram-icon.svg',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/dispatchride',
    icon: 'linkedin-icon.svg',
  },
];

/**
 * Animation configuration
 * Settings for Intersection Observer animations
 */
export const ANIMATION_CONFIG = {
  threshold: 0.1,
  duration: 600,
  easing: 'ease-out',
  delay: 100,
};