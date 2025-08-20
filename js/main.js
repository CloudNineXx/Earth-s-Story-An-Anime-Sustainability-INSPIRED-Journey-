// main.js - Main Application Entry Point
// This file initializes the Sustainability Website application

class SustainabilityWebsite {
  constructor() {
    // Core Properties
    this.currentSlide = 0;
    this.slides = document.querySelectorAll(".slide");
    this.dots = document.querySelectorAll(".dot");
    this.slidesContainer = document.querySelector(".slides-container");
    this.scrollIndicator = document.querySelector(".scroll-indicator");
    this.isScrolling = false;
    this.lastScrollTime = 0;
    this.isTransitioning = false;

    // Initialize Controllers
    this.initializeControllers();
    
    // Initialize Features
    this.init();
  }

  initializeControllers() {
    // Initialize Audio Controller
    this.audioController = new AudioController(this);
    
    // Initialize Autoplay Controller
    this.autoplayController = new AutoplayController(this);
    
    // Initialize Navigation Controller
    this.navigationController = new NavigationController(this);
    
    // Initialize Visual Effects Controller
    this.visualEffects = new VisualEffectsController(this);
  }

  init() {
    // Setup all features
    this.navigationController.setupEventListeners();
    this.visualEffects.setupParallax();
    this.visualEffects.setupIntersectionObserver();
    this.visualEffects.setupCustomCursor();
    this.navigationController.hideScrollIndicator();
    this.navigationController.updateNavigationDots();
    this.audioController.setupAudio();
    this.audioController.setupFirstInteraction();
    this.audioController.setupAudioToggle();
    this.autoplayController.setupAutoplay();
  }

  // Public Methods for Controllers to Access
  getCurrentSlideIndex() {
    return this.currentSlide;
  }

  getTotalSlides() {
    return this.slides.length;
  }

  setCurrentSlide(index) {
    this.currentSlide = index;
  }

  updateCurrentSlide(slide) {
    const slideIndex = Array.from(this.slides).indexOf(slide);
    if (
      slideIndex !== this.currentSlide &&
      slideIndex >= 0 &&
      slideIndex < this.slides.length
    ) {
      this.currentSlide = slideIndex;
      this.navigationController.updateNavigationDots();
      this.navigationController.updateScrollIndicator();

      // Handle audio for specific slides
      if (slideIndex === 10 || slideIndex === this.slides.length - 1) {
        this.audioController.stopAllSlideAudio();
        if (slideIndex === this.slides.length - 1) {
          this.scrollIndicator.style.display = "none";
          // Disable autoplay on last slide
          if (this.autoplayController.autoplayEnabled) {
            this.autoplayController.disableAutoplay();
          }
        }
      } else {
        this.audioController.playSlideAudio(slideIndex);
        this.scrollIndicator.style.display = "block";
      }

      // Handle autoplay for slides without audio
      if (this.autoplayController.autoplayEnabled && !this.isTransitioning) {
        const currentSlideElement = this.slides[slideIndex];
        const hasAudio =
          currentSlideElement.dataset.audio &&
          slideIndex !== 10 &&
          this.audioController.slideAudioEnabled;

        if (!hasAudio) {
          this.autoplayController.startAutoplayTimer();
        }
      }
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const website = new SustainabilityWebsite();
  window.sustainabilityWebsite = website;
});