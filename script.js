// Sustainability Website - Interactive JavaScript with Audio
class SustainabilityWebsite {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll(".slide");
    this.dots = document.querySelectorAll(".dot");
    this.slidesContainer = document.querySelector(".slides-container");
    this.scrollIndicator = document.querySelector(".scroll-indicator");
    this.isScrolling = false;
    this.lastScrollTime = 0;

    // Custom Cursor
    this.customCursor = document.getElementById("custom-cursor");

    // Audio elements
    this.bgMusic = document.getElementById("bg-music");
    this.slideAudios = document.querySelectorAll(".slide-audio");
    this.currentSlideAudio = null;
    this.bgMusicBtn = document.getElementById("toggle-bg-music");
    this.slideAudioBtn = document.getElementById("toggle-slide-audio");
    this.volumeSlider = document.getElementById("volume-slider");

    // Audio toggle button and controls
    this.audioToggleBtn = document.getElementById("audio-toggle-btn");
    this.audioControls = document.querySelector(".audio-controls");
    this.controlsVisible = false;

    // Audio states
    this.bgMusicEnabled = true;
    this.slideAudioEnabled = true;
    this.hasUserInteracted = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupParallax();
    this.setupIntersectionObserver();
    this.hideScrollIndicator();
    this.updateNavigationDots();
    this.setupCustomCursor();
    this.setupAudio();
    this.setupFirstInteraction();
    this.setupAudioToggle();
  }

  setupAudio() {
    // Set initial volume
    const initialVolume = 0.5;
    this.bgMusic.volume = initialVolume * 0.3; // Background music quieter
    this.slideAudios.forEach((audio) => {
      audio.volume = initialVolume;
    });
    this.volumeSlider.value = initialVolume * 100;

    // Initialize slider gradient
    this.volumeSlider.style.background = `linear-gradient(to right, #4ecdc4 0%, #4ecdc4 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 100%)`;

    // Audio control button listeners
    this.bgMusicBtn.addEventListener("click", () => {
      this.toggleBackgroundMusic();
    });

    this.slideAudioBtn.addEventListener("click", () => {
      this.toggleSlideAudio();
    });

    // Volume control
    this.volumeSlider.addEventListener("input", (e) => {
      this.updateVolume(e.target.value / 100);
    });

    // Fade in/out functions for smooth transitions
    this.fadeAudio = {
      in: (audio, duration = 1000, targetVolume = null) => {
        if (!audio) return;
        const target = targetVolume || audio.volume;
        audio.volume = 0;
        audio.play().catch((e) => console.log("Audio play prevented:", e));

        const fadeInInterval = setInterval(() => {
          if (audio.volume < target - 0.05) {
            audio.volume += 0.05;
          } else {
            audio.volume = target;
            clearInterval(fadeInInterval);
          }
        }, duration / 20);
      },
      out: (audio, duration = 1000) => {
        if (!audio) return;
        const startVolume = audio.volume;

        const fadeOutInterval = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume -= 0.05;
          } else {
            audio.pause();
            audio.volume = startVolume; // Reset volume for next play
            clearInterval(fadeOutInterval);
          }
        }, duration / 20);
      },
    };
  }

  setupAudioToggle() {
    // Toggle audio controls panel
    this.audioToggleBtn.addEventListener("click", () => {
      this.toggleAudioControls();
    });

    // Close audio controls when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.controlsVisible &&
        !this.audioControls.contains(e.target) &&
        !this.audioToggleBtn.contains(e.target)
      ) {
        this.hideAudioControls();
      }
    });

    // Prevent closing when clicking inside the controls
    this.audioControls.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Add keyboard shortcut (M key) to toggle audio controls
    document.addEventListener("keydown", (e) => {
      if (
        e.key.toLowerCase() === "m" &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        this.toggleAudioControls();
      }
    });
  }

  toggleAudioControls() {
    if (this.controlsVisible) {
      this.hideAudioControls();
    } else {
      this.showAudioControls();
    }
  }

  showAudioControls() {
    this.controlsVisible = true;
    this.audioControls.classList.remove("hidden");
    this.audioToggleBtn.classList.add("active");

    // Animate the toggle button
    this.audioToggleBtn.style.transform = "rotate(180deg)";
  }

  hideAudioControls() {
    this.controlsVisible = false;
    this.audioControls.classList.add("hidden");
    this.audioToggleBtn.classList.remove("active");

    // Reset toggle button rotation
    this.audioToggleBtn.style.transform = "rotate(0deg)";
  }

  setupFirstInteraction() {
    // Start audio on first user interaction
    const startAudio = () => {
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;

        // Start background music
        if (this.bgMusicEnabled) {
          this.bgMusic.play().catch((e) => {
            console.log("Background music autoplay prevented:", e);
          });
        }

        // Play current slide audio if exists and not on slide 11
        const currentSlideElement = this.slides[this.currentSlide];
        if (
          currentSlideElement &&
          this.slideAudioEnabled &&
          this.currentSlide !== 10
        ) {
          const audioId = currentSlideElement.dataset.audio;
          if (audioId) {
            const audio = document.getElementById(audioId);
            if (audio) {
              this.currentSlideAudio = audio;
              this.fadeAudio.in(audio, 1000);
            }
          }
        }

        // Remove the event listeners after first interaction
        document.removeEventListener("click", startAudio);
        document.removeEventListener("keydown", startAudio);
        document.removeEventListener("scroll", startAudio);
        document.removeEventListener("touchstart", startAudio);
      }
    };

    // Add multiple event listeners for first interaction
    document.addEventListener("click", startAudio, { once: true });
    document.addEventListener("keydown", startAudio, { once: true });
    document.addEventListener("scroll", startAudio, { once: true });
    document.addEventListener("touchstart", startAudio, { once: true });
  }

  toggleBackgroundMusic() {
    this.bgMusicEnabled = !this.bgMusicEnabled;

    if (this.bgMusicEnabled) {
      this.bgMusic.play().catch((e) => console.log("Audio play prevented:", e));
      this.bgMusicBtn.classList.remove("muted");
      this.bgMusicBtn.innerHTML = '<span class="audio-icon">🎵</span>';
    } else {
      this.bgMusic.pause();
      this.bgMusicBtn.classList.add("muted");
      this.bgMusicBtn.innerHTML = '<span class="audio-icon">🔇</span>';
    }
  }

  toggleSlideAudio() {
    this.slideAudioEnabled = !this.slideAudioEnabled;

    if (this.slideAudioEnabled) {
      this.slideAudioBtn.classList.remove("muted");
      this.slideAudioBtn.innerHTML = '<span class="audio-icon">🔊</span>';
      // Play current slide audio if exists and not on slide 11
      const currentSlideElement = this.slides[this.currentSlide];
      if (currentSlideElement && this.currentSlide !== 10) {
        const audioId = currentSlideElement.dataset.audio;
        if (audioId) {
          const audio = document.getElementById(audioId);
          if (audio) {
            this.currentSlideAudio = audio;
            this.fadeAudio.in(audio, 1000);
          }
        }
      }
    } else {
      this.slideAudioBtn.classList.add("muted");
      this.slideAudioBtn.innerHTML = '<span class="audio-icon">🔈</span>';
      // Stop current slide audio
      if (this.currentSlideAudio) {
        this.fadeAudio.out(this.currentSlideAudio, 500);
        this.currentSlideAudio = null;
      }
    }
  }

  updateVolume(value) {
    this.bgMusic.volume = value * 0.3; // Keep background music quieter
    this.slideAudios.forEach((audio) => {
      const wasPlaying = !audio.paused;
      const currentTime = audio.currentTime;
      audio.volume = value;
      // Maintain playback state
      if (wasPlaying) {
        audio.currentTime = currentTime;
      }
    });

    // Update visual feedback
    const volumeIcons = document.querySelectorAll(".volume-icon");
    if (value === 0) {
      volumeIcons[0].textContent = "🔇";
      volumeIcons[1].textContent = "🔇";
    } else if (value < 0.5) {
      volumeIcons[0].textContent = "🔉";
      volumeIcons[1].textContent = "🔉";
    } else {
      volumeIcons[0].textContent = "🔉";
      volumeIcons[1].textContent = "🔊";
    }

    // Update slider gradient fill
    const percentage = value * 100;
    this.volumeSlider.style.background = `linear-gradient(to right, #4ecdc4 0%, #4ecdc4 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`;
  }

  playSlideAudio(slideIndex) {
    // Don't play audio for slide 11 (index 10) - the "Thank You" slide
    if (!this.slideAudioEnabled || !this.hasUserInteracted || slideIndex === 10)
      return;

    const slide = this.slides[slideIndex];
    if (!slide) return;

    const audioId = slide.dataset.audio;
    if (!audioId) return;

    const newAudio = document.getElementById(audioId);
    if (!newAudio) return;

    // Fade out current audio if different
    if (this.currentSlideAudio && this.currentSlideAudio !== newAudio) {
      this.fadeAudio.out(this.currentSlideAudio, 500);
    }

    // Fade in new audio
    if (newAudio !== this.currentSlideAudio) {
      this.currentSlideAudio = newAudio;
      // Reset audio to beginning
      newAudio.currentTime = 0;
      this.fadeAudio.in(newAudio, 1000);
    }
  }

  stopAllSlideAudio() {
    this.slideAudios.forEach((audio) => {
      if (!audio.paused) {
        this.fadeAudio.out(audio, 500);
      }
    });
    this.currentSlideAudio = null;
  }

  setupEventListeners() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    this.slidesContainer.addEventListener("scroll", (e) => {
      this.handleScroll(e);
    });

    document.addEventListener("keydown", (e) => {
      this.handleKeyboard(e);
    });

    this.setupTouchSupport();

    window.addEventListener("resize", () => {
      this.handleResize();
    });

    this.slidesContainer.addEventListener("wheel", (e) => {
      this.handleWheel(e);
    });
  }

  setupParallax() {
    this.slidesContainer.addEventListener("scroll", () => {
      const scrolled = this.slidesContainer.scrollTop;

      this.slides.forEach((slide, index) => {
        const parallaxBg = slide.querySelector(".parallax-bg");
        if (parallaxBg) {
          const slideTop = index * window.innerHeight;
          const slideBottom = slideTop + window.innerHeight;
          const viewportCenter = scrolled + window.innerHeight / 2;

          if (viewportCenter >= slideTop && viewportCenter <= slideBottom) {
            const speed = 0.2;
            const relativeScroll = scrolled - slideTop;
            const yPos = -(relativeScroll * speed);

            const maxMove = window.innerHeight * 0.3;
            const clampedYPos = Math.max(-maxMove, Math.min(maxMove, yPos));

            parallaxBg.style.transform = `translateY(${clampedYPos}px)`;
          } else {
            parallaxBg.style.transform = "translateY(0px)";
          }
        }
      });
    });
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.5,
    };
    const observer = new IntersectionObserver((entries) => {
      const toggleBirds = (slideId, show) => {
        document
          .querySelectorAll(`.animated-bird[id^="bird-${slideId}"]`)
          .forEach((bird) => {
            bird.style.display = show ? "block" : "none";
            bird.style.animationPlayState = show ? "running" : "paused";
          });
      };

      entries.forEach((entry) => {
        const title = entry.target.querySelector(".slide-title");
        const text = entry.target.querySelector(".slide-text");
        const parallaxBg = entry.target.querySelector(".parallax-bg");
        const slideId = entry.target.id;

        // Determine if this slide should have birds
        const hasBirds =
          slideId === "slide-1" ||
          slideId === "slide-2" ||
          slideId === "slide-4" ||
          slideId === "slide-5";

        if (entry.isIntersecting) {
          if (title) title.classList.add("animate-in");
          if (text) text.classList.add("animate-in");
          if (parallaxBg) parallaxBg.classList.add("fade-in");

          if (hasBirds) {
            toggleBirds(slideId.replace("slide-", ""), true);
          }

          this.updateCurrentSlide(entry.target);
        } else {
          if (title) title.classList.remove("animate-in");
          if (text) text.classList.remove("animate-in");
          if (parallaxBg) parallaxBg.classList.remove("fade-in");

          if (hasBirds) {
            toggleBirds(slideId.replace("slide-", ""), false);
          }
        }
      });
    }, options);

    this.slides.forEach((slide) => {
      observer.observe(slide);
    });
  }

  setupCustomCursor() {
    if (!this.customCursor) return;

    document.addEventListener("mousemove", (e) => {
      requestAnimationFrame(() => {
        this.customCursor.style.left = `${e.clientX}px`;
        this.customCursor.style.top = `${e.clientY}px`;
      });
    });

    this.customCursor.classList.add("star-mode");
  }

  updateCurrentSlide(slide) {
    const slideIndex = Array.from(this.slides).indexOf(slide);
    if (
      slideIndex !== this.currentSlide &&
      slideIndex >= 0 &&
      slideIndex < this.slides.length
    ) {
      this.currentSlide = slideIndex;
      this.updateNavigationDots();
      this.updateScrollIndicator();

      // Stop audio on slide 11 (index 10) and the final slide
      if (slideIndex === 10 || slideIndex === this.slides.length - 1) {
        this.stopAllSlideAudio();
        // Hide the scroll indicator on the last slide
        if (slideIndex === this.slides.length - 1) {
          this.scrollIndicator.style.display = "none";
        }
      } else {
        this.playSlideAudio(slideIndex);
        this.scrollIndicator.style.display = "block";
      }
    }
  }

  updateNavigationDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentSlide);
    });
  }

  updateScrollIndicator() {
    if (this.currentSlide === this.slides.length - 1) {
      this.scrollIndicator.style.opacity = "0";
    } else {
      this.scrollIndicator.style.opacity = "1";
    }
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    this.currentSlide = index;
    const targetScrollTop = index * window.innerHeight;

    this.smoothScrollTo(targetScrollTop);
    this.updateNavigationDots();

    // Stop audio on slide 11 (index 10) and the final slide
    if (index === 10 || index === this.slides.length - 1) {
      this.stopAllSlideAudio();
    } else {
      this.playSlideAudio(index);
    }
  }

  smoothScrollTo(targetScrollTop) {
    this.slidesContainer.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }

  handleScroll(e) {
    const scrollTop = this.slidesContainer.scrollTop;
    const slideHeight = window.innerHeight;
    const currentSlideIndex = Math.round(scrollTop / slideHeight);

    if (currentSlideIndex !== this.currentSlide) {
      this.currentSlide = currentSlideIndex;
      this.updateNavigationDots();
      this.updateScrollIndicator();

      // Stop audio on slide 11 (index 10) and the final slide
      if (
        currentSlideIndex === 10 ||
        currentSlideIndex === this.slides.length - 1
      ) {
        this.stopAllSlideAudio();
      } else {
        this.playSlideAudio(currentSlideIndex);
      }
    }
  }

  handleKeyboard(e) {
    // Don't handle arrow keys if audio controls are visible to avoid conflicts
    if (
      this.controlsVisible &&
      (e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight")
    ) {
      return;
    }

    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        this.goToSlide(Math.max(0, this.currentSlide - 1));
        break;
      case "ArrowDown":
      case "ArrowRight":
      case " ":
        e.preventDefault();
        this.goToSlide(Math.min(this.slides.length - 1, this.currentSlide + 1));
        break;
      case "Home":
        e.preventDefault();
        this.goToSlide(0);
        break;
      case "End":
        e.preventDefault();
        this.goToSlide(this.slides.length - 1);
        break;
    }
  }

  setupTouchSupport() {
    let startY = 0;
    this.slidesContainer.addEventListener(
      "touchstart",
      (e) => {
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    this.slidesContainer.addEventListener(
      "touchend",
      (e) => {
        const deltaY = startY - e.changedTouches[0].clientY;
        const threshold = 50;

        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            this.goToSlide(
              Math.min(this.slides.length - 1, this.currentSlide + 1)
            );
          } else {
            this.goToSlide(Math.max(0, this.currentSlide - 1));
          }
        }
      },
      { passive: true }
    );
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY;
    const threshold = 30;

    if (Math.abs(delta) > threshold) {
      if (delta > 0) {
        this.goToSlide(Math.min(this.slides.length - 1, this.currentSlide + 1));
      } else {
        this.goToSlide(Math.max(0, this.currentSlide - 1));
      }
    }
  }

  handleResize() {
    setTimeout(() => {
      this.goToSlide(this.currentSlide);
    }, 100);
  }

  hideScrollIndicator() {
    let hasInteracted = false;

    const hideIndicator = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        this.scrollIndicator.style.transition = "opacity 0.5s ease";
        this.scrollIndicator.style.opacity = "0";

        setTimeout(() => {
          this.scrollIndicator.style.display = "none";
        }, 500);
      }
    };

    this.slidesContainer.addEventListener("scroll", hideIndicator, {
      once: true,
    });
    document.addEventListener("keydown", hideIndicator, { once: true });
    document.addEventListener("click", hideIndicator, { once: true });
  }

  getCurrentSlideIndex() {
    return this.currentSlide;
  }

  getTotalSlides() {
    return this.slides.length;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const website = new SustainabilityWebsite();
  window.sustainabilityWebsite = website;
});
