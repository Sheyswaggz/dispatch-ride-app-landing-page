/**
 * Main JavaScript entry point for Dispatch Ride Landing Page
 * Handles navigation, smooth scrolling, and interactive features
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  // Scroll behavior
  scrollOffset: 80, // Height of fixed header
  scrollDuration: 800,
  
  // Intersection Observer thresholds
  observerThreshold: 0.1,
  
  // Animation delays
  animationDelay: 100,
  
  // Breakpoints
  mobileBreakpoint: 768,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  isMobileMenuOpen: false,
  currentSection: null,
  isScrolling: false,
};

// Development mode logging
if (__DEV__) {
  console.warn('Running in development mode');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

if (__DEV__) {
  console.warn('Utility functions loaded');
}

// ============================================================================
// SMOOTH SCROLLING
// ============================================================================

/**
 * Smooth scroll to target element
 * @param {HTMLElement} target - Target element to scroll to
 */
function smoothScrollTo(target) {
  if (!target) return;
  
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition - CONFIG.scrollOffset;
  const startTime = performance.now();
  
  function animation(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / CONFIG.scrollDuration, 1);
    
    // Easing function (ease-in-out)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    window.scrollTo(0, startPosition + distance * ease);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    } else {
      state.isScrolling = false;
    }
  }
  
  state.isScrolling = true;
  requestAnimationFrame(animation);
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelectorAll('.nav__link');
  
  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavLinkClick);
  });
  
  // Sticky navigation on scroll
  window.addEventListener('scroll', throttle(handleScroll, 100));
  
  // Close mobile menu on window resize
  window.addEventListener('resize', debounce(handleResize, 250));
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  state.isMobileMenuOpen = !state.isMobileMenuOpen;
  const nav = document.querySelector('.nav');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  
  if (nav) {
    nav.classList.toggle('nav--open', state.isMobileMenuOpen);
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.setAttribute('aria-expanded', state.isMobileMenuOpen);
  }
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = state.isMobileMenuOpen ? 'hidden' : '';
}

/**
 * Handle navigation link clicks
 * @param {Event} e - Click event
 */
function handleNavLinkClick(e) {
  const href = e.currentTarget.getAttribute('href');
  
  // Only handle internal links
  if (!href || !href.startsWith('#')) return;
  
  e.preventDefault();
  
  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);
  
  if (Boolean(targetElement)) {
    smoothScrollTo(targetElement);
    
    if (Boolean(state.isMobileMenuOpen)) {
      toggleMobileMenu();
    }
    
    // Update URL without triggering scroll
    history.pushState(null, '', href);
  }
}

/**
 * Handle scroll events
 */
function handleScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  
  const scrollPosition = window.pageYOffset;
  
  // Add sticky class when scrolled past header
  if (scrollPosition > 100) {
    nav.classList.add('nav--sticky');
  } else {
    nav.classList.remove('nav--sticky');
  }
  
  // Update active navigation link
  updateActiveNavLink();
}

/**
 * Handle window resize
 */
function handleResize() {
  if (window.innerWidth > CONFIG.mobileBreakpoint && state.isMobileMenuOpen) {
    toggleMobileMenu();
  }
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  
  let currentSection = null;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - CONFIG.scrollOffset - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    const scrollPosition = window.pageYOffset;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSection = section.id;
    }
  });
  
  if (currentSection !== state.currentSection) {
    state.currentSection = currentSection;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }
}

// ============================================================================
// INTERSECTION OBSERVER
// ============================================================================

/**
 * Initialize Intersection Observer for animations
 */
function initIntersectionObserver() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: CONFIG.observerThreshold,
  };
  
  const observer = new IntersectionObserver(handleIntersection, observerOptions);
  
  // Observe all sections and animated elements
  const elementsToObserve = document.querySelectorAll(
    'section, .feature-card, .cta-section'
  );
  
  elementsToObserve.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Handle intersection observer callback
 * @param {IntersectionObserverEntry[]} entries - Observed entries
 */
function handleIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}

// ============================================================================
// EVENT DELEGATION
// ============================================================================

/**
 * Initialize event delegation for dynamic elements
 */
function initEventDelegation() {
  document.addEventListener('click', handleDocumentClick);
}

/**
 * Handle document-level clicks
 * @param {Event} e - Click event
 */
function handleDocumentClick(e) {
  const target = e.target;
  
  // Handle CTA button clicks
  if (target.matches('.cta-button, .cta-button *')) {
    const button = target.closest('.cta-button');
    handleCtaClick(button);
  }
  
  // Close mobile menu when clicking outside
  if (state.isMobileMenuOpen && !target.closest('.nav')) {
    toggleMobileMenu();
  }
}

/**
 * Handle CTA button clicks
 * @param {HTMLElement} button - CTA button element
 */
function handleCtaClick(button) {
  if (!button) return;
  
  const href = button.getAttribute('href');
  
  // Handle internal links
  if (href && href.startsWith('#')) {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      smoothScrollTo(targetElement);
    }
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler
 */
function initErrorHandling() {
  window.addEventListener('error', (_error) => {
    // Log error in development, send to monitoring in production
    if (__DEV__) {
      console.error('Global error:', _error);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // Log unhandled promise rejections
    if (__DEV__) {
      console.error('Unhandled promise rejection:', event.reason);
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all functionality when DOM is ready
 */
function init() {
  try {
    initNavigation();
    initIntersectionObserver();
    initEventDelegation();
    initErrorHandling();
    
    // Handle initial hash in URL
    if (window.location.hash) {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        setTimeout(() => {
          smoothScrollTo(targetElement);
        }, 100);
      }
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================================================
// HOT MODULE REPLACEMENT (Development only)
// ============================================================================

if (__DEV__ && module.hot) {
  module.hot.accept();
}