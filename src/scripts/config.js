/**
 * Application Configuration
 * Central configuration for the Dispatch Ride Landing Page
 */

const config = {
  // Feature flags
  how_it_works_enabled: true,

  // Application metadata
  app: {
    name: 'Dispatch Ride',
    version: '1.0.0',
    description: 'Your reliable ride booking solution',
  },

  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    observerOptions: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  },

  // Image optimization settings
  images: {
    lazyLoad: true,
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
    formats: ['webp', 'png', 'jpg'],
  },

  // Footer configuration
  footer: {
    company: {
      name: 'Dispatch Ride',
      description: 'Your reliable ride booking solution for everyday travel.',
      email: 'contact@dispatchride.com',
      phone: '+1 (555) 123-4567',
    },
    socialMedia: {
      facebook: 'https://facebook.com/dispatchride',
      twitter: 'https://twitter.com/dispatchride',
      instagram: 'https://instagram.com/dispatchride',
      linkedin: 'https://linkedin.com/company/dispatchride',
    },
    links: {
      product: [
        { text: 'Features', href: '#features' },
        { text: 'How It Works', href: '#how-it-works' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Download', href: '#download' },
      ],
      company: [
        { text: 'About Us', href: '#about' },
        { text: 'Careers', href: '#careers' },
        { text: 'Press', href: '#press' },
        { text: 'Blog', href: '#blog' },
      ],
      support: [
        { text: 'Help Center', href: '#help' },
        { text: 'Safety', href: '#safety' },
        { text: 'Contact Us', href: '#contact' },
        { text: 'FAQs', href: '#faqs' },
      ],
      legal: [
        { text: 'Privacy Policy', href: '#privacy' },
        { text: 'Terms of Service', href: '#terms' },
        { text: 'Cookie Policy', href: '#cookies' },
      ],
    },
    copyright: {
      year: new Date().getFullYear(),
      text: 'Dispatch Ride. All rights reserved.',
    },
  },

  // API endpoints (if needed in future)
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.dispatchride.com',
    timeout: 10000,
  },

  // Performance settings
  performance: {
    enableMetrics: true,
    reportInterval: 30000,
  },
};

export default config;