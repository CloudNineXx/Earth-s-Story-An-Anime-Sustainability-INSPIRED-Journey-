// navigationController.js - Navigation Management Module
// Handles slide navigation, keyboard controls, touch support, and scroll behavior

class NavigationController {
  constructor(app) {
    this.app = app;
    this.startY = 0; // For touch support
  }

  setupEventListeners() {
    // Navigation dots
    this.app.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        // Stop autoplay timer when manually navigating
        if (this.app.autoplayController && this.app.autoplayController.autoplayEnabled) {
          this.app.autoplayController.stopAutoplayTimer();
        }
        this.goToSlide(index);
      });
    });

    // Scroll events
    this.app.slidesContainer.addEventListener("scroll", (e) => {
      this.handleScroll(e);
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      this.handleKeyboard(e);
    });

    // Touch support
    this.setupTouchSupport();

    // Window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Wheel navigation
    this.app.slidesContainer.addEventListener("wheel", (e) => {
      this.handleWheel(e);
    });
  }

  goToSlide(index) {
    if (index < 0 || index >= this.app.slides.length) return;

    this.app.currentSlide = index;
    const targetScrollTop = index * window.innerHeight;

    this.smoothScrollTo(targetScrollTop);
    this.updateNavigationDots();

    // Stop audio on slide 11 (index 10) and the final slide
    if (index === 10 || index === this.app.slides.length - 1) {
      this.app.audioController.stopAllSlideAudio();
    } else {
      this.app.audioController.playSlideAudio(index);
    }
  }

  smoothScrollTo(targetScrollTop) {
    this.app.slidesContainer.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }

  handleScroll(e) {
    // Stop autoplay timer when manually scrolling
    if (this.app.autoplayController && 
        this.app.autoplayController.autoplayEnabled && 
        !this.app.isTransitioning) {
      this.app.autoplayController.stopAutoplayTimer();
    }

    const scrollTop = this.app.slidesContainer.scrollTop;
    const slideHeight = window.innerHeight;
    const currentSlideIndex = Math.round(scrollTop / slideHeight);

    if (currentSlideIndex !== this.app.currentSlide) {
      this.app.currentSlide = currentSlideIndex;
      this.updateNavigationDots();
      this.updateScrollIndicator();

      // Stop audio on slide 11 (index 10) and the final slide
      if (
        currentSlideIndex === 10 ||
        currentSlideIndex === this.app.slides.length - 1
      ) {
        this.app.audioController.stopAllSlideAudio();
      } else {
        this.app.audioController.playSlideAudio(currentSlideIndex);
      }
    }
  }

  handleKeyboard(e) {
    // Don't handle arrow keys if audio controls are visible to avoid conflicts
    const audioController = this.app.audioController;
    if (
      audioController.controlsVisible &&
      (e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight")
    ) {
      return;
    }

    // Stop autoplay timer when manually navigating
    if (this.app.autoplayController && this.app.autoplayController.autoplayEnabled) {
      this.app.autoplayController.stopAutoplayTimer();
    }

    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        this.goToSlide(Math.max(0, this.app.currentSlide - 1));
        break;
      case "ArrowDown":
      case "ArrowRight":
      case " ":
        e.preventDefault();
        this.goToSlide(Math.min(this.app.slides.length - 1, this.app.currentSlide + 1));
        break;
      case "Home":
        e.preventDefault();
        this.goToSlide(0);
        break;
      case "End":
        e.preventDefault();
        this.goToSlide(this.app.slides.length - 1);
        break;
    }
  }

  setupTouchSupport() {
    this.app.slidesContainer.addEventListener(
      "touchstart",
      (e) => {
        this.startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    this.app.slidesContainer.addEventListener(
      "touchend",
      (e) => {
        // Stop autoplay timer when manually swiping
        if (this.app.autoplayController && this.app.autoplayController.autoplayEnabled) {
          this.app.autoplayController.stopAutoplayTimer();
        }

        const deltaY = this.startY - e.changedTouches[0].clientY;
        const threshold = 50;

        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            this.goToSlide(
              Math.min(this.app.slides.length - 1, this.app.currentSlide + 1)
            );
          } else {
            this.goToSlide(Math.max(0, this.app.currentSlide - 1));
          }
        }
      },
      { passive: true }
    );
  }

  handleWheel(e) {
    e.preventDefault();

    // Stop autoplay timer when manually scrolling with wheel
    if (this.app.autoplayController && 
        this.app.autoplayController.autoplayEnabled && 
        !this.app.isTransitioning) {
      this.app.autoplayController.stopAutoplayTimer();
    }

    const delta = e.deltaY;
    const threshold = 30;

    if (Math.abs(delta) > threshold) {
      if (delta > 0) {
        this.goToSlide(Math.min(this.app.slides.length - 1, this.app.currentSlide + 1));
      } else {
        this.goToSlide(Math.max(0, this.app.currentSlide - 1));
      }
    }
  }

  handleResize() {
    setTimeout(() => {
      this.goToSlide(this.app.currentSlide);
    }, 100);
  }

  updateNavigationDots() {
    this.app.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.app.currentSlide);
    });
  }

  updateScrollIndicator() {
    if (this.app.currentSlide === this.app.slides.length - 1) {
      this.app.scrollIndicator.style.opacity = "0";
    } else {
      this.app.scrollIndicator.style.opacity = "1";
    }
  }

  hideScrollIndicator() {
    let hasInteracted = false;

    const hideIndicator = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        this.app.scrollIndicator.style.transition = "opacity 0.5s ease";
        this.app.scrollIndicator.style.opacity = "0";

        setTimeout(() => {
          this.app.scrollIndicator.style.display = "none";
        }, 500);
      }
    };

    this.app.slidesContainer.addEventListener("scroll", hideIndicator, {
      once: true,
    });
    document.addEventListener("keydown", hideIndicator, { once: true });
    document.addEventListener("click", hideIndicator, { once: true });
  }
}