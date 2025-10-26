/**
 * Main JavaScript entry point for Dispatch Ride Landing Page
 * Handles navigation, smooth scrolling, form validation, and interactive features
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
  
  // Form validation
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneRegex: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  isMenuOpen: false,
  activeSection: 'hero',
  scrollPosition: 0,
  isScrolling: false,
};

if (__DEV__) {
  console.warn('App initialized in development mode');
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

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Target element
 * @param {number} offset - Scroll offset
 */
function smoothScrollTo(element, offset = CONFIG.scrollOffset) {
  if (!element) return;
  
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

/**
 * Get current scroll position
 * @returns {number} Current scroll position
 */
function getScrollPosition() {
  return window.pageYOffset || document.documentElement.scrollTop;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================================
// NAVIGATION FUNCTIONALITY
// ============================================================================

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  if (!header || !menuToggle) {
    console.error('Required navigation elements not found');
    return;
  }
  
  // Mobile menu toggle
  menuToggle.addEventListener('click', toggleMobileMenu);
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavLinkClick);
  });
  
  // Header scroll behavior
  window.addEventListener('scroll', throttle(handleScroll, 100));
  
  // Close mobile menu on outside click
  document.addEventListener('click', handleOutsideClick);
  
  // Handle escape key to close menu
  document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  state.isMenuOpen = !state.isMenuOpen;
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', state.isMenuOpen.toString());
    menuToggle.classList.toggle('active', state.isMenuOpen);
  }
  
  document.body.classList.toggle('menu-open', state.isMenuOpen);
}

/**
 * Handle navigation link clicks
 * @param {Event} e - Click event
 */
function handleNavLinkClick(e) {
  e.preventDefault();
  
  const targetId = e.currentTarget.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  
  if (targetElement) {
    smoothScrollTo(targetElement);
    
    // Close mobile menu if open
    if (state.isMenuOpen) {
      toggleMobileMenu();
    }
    
    // Update active state
    updateActiveNavLink(targetId);
  }
}

/**
 * Handle scroll events
 */
function handleScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  
  const scrollPosition = getScrollPosition();
  
  // Add/remove scrolled class
  if (scrollPosition > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  // Update active section
  updateActiveSection();
  
  state.scrollPosition = scrollPosition;
}

/**
 * Handle clicks outside mobile menu
 * @param {Event} e - Click event
 */
function handleOutsideClick(e) {
  if (!state.isMenuOpen) return;
  
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  const element = e.target;
  const actualHandler = element && !menuToggle?.contains(element) && !nav?.contains(element);
  
  if (actualHandler) {
    toggleMobileMenu();
  }
}

/**
 * Handle escape key press
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleEscapeKey(e) {
  if (e.key === 'Escape' && state.isMenuOpen) {
    toggleMobileMenu();
  }
}

/**
 * Update active navigation link
 * @param {string} targetId - Target section ID
 */
function updateActiveNavLink(targetId) {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Update active section based on scroll position
 */
function updateActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = getScrollPosition();
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - CONFIG.scrollOffset - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      if (state.activeSection !== sectionId) {
        state.activeSection = sectionId;
        updateActiveNavLink(`#${sectionId}`);
      }
    }
  });
}

// ============================================================================
// FORM VALIDATION & HANDLING
// ============================================================================

/**
 * Initialize form functionality
 */
function initForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  });
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Validate all fields
  const isValid = validateForm(form);
  
  if (!isValid) {
    return;
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }
  
  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    showFormSuccess(form);
    form.reset();
    
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  }, 1500);
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} True if form is valid
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  return isValid;
}

/**
 * Validate individual field
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Field to validate
 * @returns {boolean} True if field is valid
 */
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  let errorMessage = '';
  
  // Required field check
  if (field.hasAttribute('required') && !value) {
    errorMessage = 'This field is required';
  }
  // Email validation
  else if (type === 'email' && value && !CONFIG.emailRegex.test(value)) {
    errorMessage = 'Please enter a valid email address';
  }
  // Phone validation
  else if (type === 'tel' && value && !CONFIG.phoneRegex.test(value)) {
    errorMessage = 'Please enter a valid phone number';
  }
  // Min length validation
  else if (field.hasAttribute('minlength')) {
    const minLength = parseInt(field.getAttribute('minlength'), 10);
    if (value.length < minLength) {
      errorMessage = `Minimum ${minLength} characters required`;
    }
  }
  
  if (errorMessage) {
    showFieldError(field, errorMessage);
    return false;
  }
  
  clearFieldError(field);
  return true;
}

/**
 * Show field error
 * @param {HTMLElement} field - Field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  const formGroup = field.closest('.form-group') || field.parentElement;
  if (!formGroup) return;
  
  // Remove existing error
  const existingError = formGroup.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error class
  formGroup.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  
  // Create and append error message
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  formGroup.appendChild(errorElement);
}

/**
 * Clear field error
 * @param {HTMLElement} field - Field element
 */
function clearFieldError(field) {
  const formGroup = field.closest('.form-group') || field.parentElement;
  if (!formGroup) return;
  
  formGroup.classList.remove('error');
  field.removeAttribute('aria-invalid');
  
  const errorMessage = formGroup.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Show form success message
 * @param {HTMLFormElement} form - Form element
 */
function showFormSuccess(form) {
  const formGroup = form.querySelector('.form-group') || form;
  
  // Create success message
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.textContent = 'Thank you! Your message has been sent successfully.';
  successElement.setAttribute('role', 'status');
  
  // Insert at the beginning of form
  form.insertBefore(successElement, form.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    successElement.remove();
  }, 5000);
}

// ============================================================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================================================

/**
 * Initialize intersection observer for scroll animations
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: CONFIG.observerThreshold,
    rootMargin: '0px 0px -100px 0px',
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Optionally unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with data-animate attribute
  const animatedElements = document.querySelectorAll('[data-animate]');
  animatedElements.forEach(element => {
    observer.observe(element);
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
    initForms();
    initScrollAnimations();
    
    // Set initial active section
    updateActiveSection();
    
    console.log('Application initialized successfully');
  } catch (_error) {
    console.error('Error initializing application');
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

if (__DEV__ && import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR: Module updated');
  });
}