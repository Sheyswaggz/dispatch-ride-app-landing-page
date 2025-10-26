/**
 * Main JavaScript file for Dispatch Ride Landing Page
 * Handles navigation, animations, form validation, and interactive features
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  animationDuration: 300,
  scrollOffset: 80,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely query a DOM element
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element|null}
 */
function querySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.error(`Error querying selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safely query multiple DOM elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {NodeList}
 */
function querySelectorAll(selector, parent = document) {
  try {
    return parent.querySelectorAll(selector);
  } catch (error) {
    console.error(`Error querying selector: ${selector}`, error);
    return [];
  }
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
function throttle(func, delay) {
  let timeoutId;
  let lastRan;
  return function (...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          if (Date.now() - lastRan >= delay) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        delay - (Date.now() - lastRan)
      );
    }
  };
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Initialize mobile navigation
 */
function initMobileNav() {
  const navToggle = querySelector('.nav-toggle');
  const navMenu = querySelector('.nav-menu');
  const navLinks = querySelectorAll('.nav-link');

  if (!navToggle || !navMenu) return;

  // Toggle mobile menu
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  });

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target) &&
      navMenu.classList.contains('active')
    ) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-open');
    }
  });
}

/**
 * Handle smooth scrolling for anchor links
 */
function initSmoothScroll() {
  const anchorLinks = querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = querySelector(href);
      if (!target) return;

      e.preventDefault();

      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - CONFIG.scrollOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    });
  });
}

/**
 * Handle sticky navigation on scroll
 */
function initStickyNav() {
  const header = querySelector('.header');
  if (!header) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);
}

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Initialize scroll animations using Intersection Observer
 */
function initScrollAnimations() {
  const animatedElements = querySelectorAll('[data-animate]');
  if (animatedElements.length === 0) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Initialize counter animations for statistics
 */
function initCounterAnimations() {
  const counters = querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-counter'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  };

  const observerOptions = {
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}

// ============================================================================
// FORM HANDLING
// ============================================================================

/**
 * Initialize form validation and submission
 */
function initFormHandling() {
  const forms = querySelectorAll('form[data-validate]');

  forms.forEach((form) => {
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
  });
}

/**
 * Validate a single form field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean}
 */
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.hasAttribute('required');
  let isValid = true;
  let errorMessage = '';

  // Required field validation
  if (required && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }

  // Email validation
  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }

  // Phone validation
  if (type === 'tel' && value) {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
  }

  // Update field state
  const errorElement = field.parentElement.querySelector('.error-message');

  if (!isValid) {
    field.classList.add('error');
    field.classList.remove('success');
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  } else {
    field.classList.remove('error');
    field.classList.add('success');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  return isValid;
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const inputs = form.querySelectorAll('input, textarea, select');
  let isValid = true;

  // Validate all fields
  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  if (!isValid) {
    // Focus first error field
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    // Success state
    submitButton.textContent = 'Sent!';
    submitButton.classList.add('success');

    // Show success message
    showNotification('Thank you! We\'ll get back to you soon.', 'success');

    // Reset form
    setTimeout(() => {
      form.reset();
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      submitButton.classList.remove('success');
      inputs.forEach((input) => {
        input.classList.remove('success', 'error');
      });
    }, 2000);
  }, 1500);
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'alert');

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, CONFIG.animationDuration);
  }, 3000);
}

// ============================================================================
// INTERACTIVE FEATURES
// ============================================================================

/**
 * Initialize FAQ accordion
 */
function initFAQAccordion() {
  const faqItems = querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
          }
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      const answer = item.querySelector('.faq-answer');
      if (answer) {
        if (!isActive) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = null;
        }
      }
    });
  });
}

/**
 * Initialize image lazy loading
 */
function initLazyLoading() {
  const images = querySelectorAll('img[data-src]');
  if (images.length === 0) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
  const backToTopButton = querySelector('.back-to-top');
  if (!backToTopButton) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all features when DOM is ready
 */
function init() {
  try {
    // Navigation
    initMobileNav();
    initSmoothScroll();
    initStickyNav();

    // Animations
    initScrollAnimations();
    initCounterAnimations();

    // Forms
    initFormHandling();

    // Interactive features
    initFAQAccordion();
    initLazyLoading();
    initBackToTop();

    console.warn('Dispatch Ride Landing Page initialized successfully');
  } catch {
    console.warn('Error initializing landing page features');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations or reduce activity when page is hidden
    console.warn('Page hidden');
  } else {
    // Resume normal activity when page is visible
    console.warn('Page visible');
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init,
    initMobileNav,
    initSmoothScroll,
    initFormHandling,
    validateField,
    showNotification,
  };
}