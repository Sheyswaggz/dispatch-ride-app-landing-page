/**
 * Animations Module
 * Handles scroll-based animations and intersection observers
 */

/**
 * Initialize scroll animations using Intersection Observer
 */
export function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  const animatedElements = document.querySelectorAll('.fade-in');
  animatedElements.forEach((el) => observer.observe(el));

  // Observe feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe how-it-works steps
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(step);
  });
}