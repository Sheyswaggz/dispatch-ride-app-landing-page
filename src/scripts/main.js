/**
 * Main JavaScript file for Dispatch Ride Landing Page
 * Handles all interactive functionality and animations
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;

  return function (...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime < delay) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastExecTime = currentTime;
        func.apply(this, args);
      }, delay);
    } else {
      lastExecTime = currentTime;
      func.apply(this, args);
    }
  };
}

/**
 * Smooth scroll to element
 * @param {string} targetId - ID of target element
 * @param {number} offset - Offset from top in pixels
 */
function smoothScrollTo(targetId, offset = 80) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition - offset;
  const duration = 800;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Easing function (ease-in-out)
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * Add animation class when element enters viewport
 * @param {Element} element - Element to observe
 * @param {string} animationClass - Class to add
 * @param {number} threshold - Intersection threshold (0-1)
 */
function observeElement(element, animationClass = 'fade-in', threshold = 0.1) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold }
  );

  observer.observe(element);
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!nav || !navToggle || !navMenu) return;

  // Toggle mobile menu
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('nav__menu--active');
    navToggle.classList.toggle('nav__toggle--active');

    // Prevent body scroll when menu is open
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  });

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Handle internal links
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);

        // Close mobile menu
        navMenu.classList.remove('nav__menu--active');
        navToggle.classList.remove('nav__toggle--active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        // Smooth scroll to target
        smoothScrollTo(targetId);
      }
    });
  });

  // Add shadow to nav on scroll
  const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !nav.contains(e.target) &&
      navMenu.classList.contains('nav__menu--active')
    ) {
      navMenu.classList.remove('nav__menu--active');
      navToggle.classList.remove('nav__toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ============================================================================
// HERO SECTION
// ============================================================================

/**
 * Initialize hero section animations
 */
function initHero() {
  const heroContent = document.querySelector('.hero__content');
  const heroImage = document.querySelector('.hero__image');

  if (heroContent) {
    setTimeout(() => {
      heroContent.classList.add('fade-in');
    }, 100);
  }

  if (heroImage) {
    setTimeout(() => {
      heroImage.classList.add('fade-in');
    }, 300);
  }
}

// ============================================================================
// FEATURES SECTION
// ============================================================================

/**
 * Initialize features section animations
 */
function initFeatures() {
  const featureCards = document.querySelectorAll('.feature-card');

  featureCards.forEach((card, index) => {
    setTimeout(() => {
      observeElement(card, 'fade-in', 0.2);
    }, index * 100);
  });
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

/**
 * Initialize how it works section animations
 */
function initHowItWorks() {
  const steps = document.querySelectorAll('.step');

  steps.forEach((step, index) => {
    setTimeout(() => {
      observeElement(step, 'fade-in', 0.2);
    }, index * 150);
  });
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

/**
 * Initialize testimonials carousel
 */
function initTestimonials() {
  const track = document.querySelector('.testimonials__track');
  const slides = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.testimonials__btn--prev');
  const nextBtn = document.querySelector('.testimonials__btn--next');
  const dotsContainer = document.querySelector('.testimonials__dots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const slideCount = slides.length;

  // Create dots
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonials__dot');
      dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      if (index === 0) dot.classList.add('testimonials__dot--active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.testimonials__dot');

  function updateSlidePosition() {
    const slideWidth = slides[0].offsetWidth;
    const gap = 32; // 2rem gap
    const offset = -(currentIndex * (slideWidth + gap));
    track.style.transform = `translateX(${offset}px)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('testimonials__dot--active', index === currentIndex);
    });

    // Update button states
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === slideCount - 1;
  }

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, slideCount - 1));
    updateSlidePosition();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Keyboard navigation
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // Initialize
  updateSlidePosition();

  // Auto-play (optional)
  // const autoPlayInterval = 5000;
  // setInterval(nextSlide, autoPlayInterval);
}

// ============================================================================
// CONTACT FORM
// ============================================================================

/**
 * Initialize contact form
 */
function initContactForm() {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  const inputs = form.querySelectorAll('.form__input, .form__textarea');
  const submitBtn = form.querySelector('.btn--primary');

  // Form validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(phone);
  }

  function showError(input, message) {
    const errorElement = input.parentElement.querySelector('.form__error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    input.classList.add('form__input--error');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    const errorElement = input.parentElement.querySelector('.form__error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    input.classList.remove('form__input--error');
    input.setAttribute('aria-invalid', 'false');
  }

  function validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const name = input.name;

    clearError(input);

    if (input.hasAttribute('required') && !value) {
      showError(input, 'This field is required');
      return false;
    }

    if (type === 'email' && value && !validateEmail(value)) {
      showError(input, 'Please enter a valid email address');
      return false;
    }

    if (type === 'tel' && value && !validatePhone(value)) {
      showError(input, 'Please enter a valid phone number');
      return false;
    }

    if (name === 'message' && value.length < 10) {
      showError(input, 'Message must be at least 10 characters');
      return false;
    }

    return true;
  }

  // Real-time validation
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('form__input--error')) {
        validateField(input);
      }
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // Disable submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      showSuccessMessage();
      form.reset();
    } catch (error) {
      showErrorMessage();
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });

  function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'form__message form__message--success';
    message.textContent = 'Thank you! Your message has been sent successfully.';
    message.setAttribute('role', 'alert');
    form.insertBefore(message, form.firstChild);

    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  function showErrorMessage() {
    const message = document.createElement('div');
    message.className = 'form__message form__message--error';
    message.textContent = 'Oops! Something went wrong. Please try again.';
    message.setAttribute('role', 'alert');
    form.insertBefore(message, form.firstChild);

    setTimeout(() => {
      message.remove();
    }, 5000);
  }
}

// ============================================================================
// SCROLL TO TOP BUTTON
// ============================================================================

/**
 * Initialize scroll to top button
 */
function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (!scrollBtn) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 500) {
      scrollBtn.classList.add('scroll-to-top--visible');
    } else {
      scrollBtn.classList.remove('scroll-to-top--visible');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Initialize scroll animations for all sections
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.section__header, .cta__content, .footer__content'
  );

  animatedElements.forEach((element) => {
    observeElement(element, 'fade-in', 0.1);
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all functionality when DOM is ready
 */
function init() {
  // Initialize all components
  initNavigation();
  initHero();
  initFeatures();
  initHowItWorks();
  initTestimonials();
  initContactForm();
  initScrollToTop();
  initScrollAnimations();

  // Add loaded class to body
  document.body.classList.add('loaded');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations or auto-play features
  } else {
    // Resume animations or auto-play features
  }
});

// Export functions for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    throttle,
    smoothScrollTo,
    observeElement,
  };
}