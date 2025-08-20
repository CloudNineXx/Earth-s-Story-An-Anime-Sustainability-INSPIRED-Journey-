// autoplayController.js - Autoplay Management Module
// Handles automatic slide progression with audio synchronization

class AutoplayController {
  constructor(app) {
    this.app = app;
    
    // Autoplay elements
    this.autoplayBtn = document.getElementById("toggle-autoplay");
    
    // Autoplay states
    this.autoplayEnabled = false;
    this.autoplayTimer = null;
    this.noAudioDelay = 1500; // 1.5 seconds for slides without audio
  }

  setupAutoplay() {
    // Autoplay button listener
    this.autoplayBtn.addEventListener("click", () => {
      this.toggleAutoplay();
    });

    // Add ended event listeners to all slide audio elements
    const slideAudios = document.querySelectorAll(".slide-audio");
    slideAudios.forEach((audio, index) => {
      audio.addEventListener("ended", () => {
        if (this.autoplayEnabled && !this.app.isTransitioning) {
          // Check if this is the audio for the current slide
          const currentSlideElement = this.app.slides[this.app.currentSlide];
          const audioId = currentSlideElement.dataset.audio;
          if (audioId && document.getElementById(audioId) === audio) {
            // Instantly advance to next slide when audio ends
            this.autoAdvanceSlide();
          }
        }
      });
    });
  }

  toggleAutoplay() {
    this.autoplayEnabled = !this.autoplayEnabled;

    if (this.autoplayEnabled) {
      this.autoplayBtn.classList.add("active");
      this.autoplayBtn.innerHTML = '<span class="autoplay-icon">⏸️</span>';

      // Check if current slide has audio
      const currentSlideElement = this.app.slides[this.app.currentSlide];
      const hasAudio =
        currentSlideElement.dataset.audio && 
        this.app.currentSlide !== 10;

      const audioController = this.app.audioController;
      
      if (!hasAudio || !audioController.slideAudioEnabled) {
        // If no audio or audio is disabled, start timer for auto-advance
        this.startAutoplayTimer();
      } else if (audioController.currentSlideAudio && 
                 !audioController.currentSlideAudio.paused) {
        // Audio is playing, will auto-advance when it ends
        // Do nothing, the ended event will handle it
      } else {
        // Audio exists but not playing, start timer
        this.startAutoplayTimer();
      }
    } else {
      this.disableAutoplay();
    }
  }

  disableAutoplay() {
    this.autoplayEnabled = false;
    this.autoplayBtn.classList.remove("active");
    this.autoplayBtn.innerHTML = '<span class="autoplay-icon">▶️</span>';
    this.stopAutoplayTimer();
  }

  startAutoplayTimer() {
    // Don't start timer if we're on the last slide
    if (this.app.currentSlide >= this.app.slides.length - 1) {
      this.stopAutoplayTimer();
      return;
    }

    this.stopAutoplayTimer(); // Clear any existing timer

    // Set timer to advance slide after delay for non-audio slides
    this.autoplayTimer = setTimeout(() => {
      if (this.autoplayEnabled && !this.app.isTransitioning) {
        this.autoAdvanceSlide();
      }
    }, this.noAudioDelay);
  }

  stopAutoplayTimer() {
    if (this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  autoAdvanceSlide() {
    if (this.app.currentSlide < this.app.slides.length - 1) {
      this.app.isTransitioning = true;
      this.app.navigationController.goToSlide(this.app.currentSlide + 1);

      // Reset transition flag after animation
      setTimeout(() => {
        this.app.isTransitioning = false;

        // Check if we should continue autoplay
        if (this.autoplayEnabled) {
          const currentSlideElement = this.app.slides[this.app.currentSlide];
          const hasAudio =
            currentSlideElement.dataset.audio &&
            this.app.currentSlide !== 10 &&
            this.app.audioController.slideAudioEnabled;

          if (!hasAudio) {
            // No audio on this slide, start timer for next slide
            this.startAutoplayTimer();
          }
          // If there's audio, the ended event will handle the next transition
        }
      }, 1000);
    } else {
      // Reached the last slide, disable autoplay
      this.disableAutoplay();
    }
  }
}