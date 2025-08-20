// audioController.js - Audio Management Module
// Handles background music, slide audio, volume control, and audio UI

class AudioController {
  constructor(app) {
    this.app = app;
    
    // Audio elements
    this.bgMusic = document.getElementById("bg-music");
    this.slideAudios = document.querySelectorAll(".slide-audio");
    this.currentSlideAudio = null;
    
    // Audio control buttons
    this.bgMusicBtn = document.getElementById("toggle-bg-music");
    this.slideAudioBtn = document.getElementById("toggle-slide-audio");
    this.volumeSlider = document.getElementById("volume-slider");
    
    // Audio toggle UI
    this.audioToggleBtn = document.getElementById("audio-toggle-btn");
    this.audioControls = document.querySelector(".audio-controls");
    this.controlsVisible = false;
    
    // Audio states
    this.bgMusicEnabled = true;
    this.slideAudioEnabled = true;
    this.hasUserInteracted = false;
    
    // Fade audio functions
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

  setupAudio() {
    // Set initial volume
    const initialVolume = 0.5;
    this.bgMusic.volume = initialVolume * 0.3; // Background music quieter
    this.slideAudios.forEach((audio) => {
      audio.volume = initialVolume;
    });
    this.volumeSlider.value = initialVolume * 100;

    // Initialize slider gradient
    this.updateVolumeSliderVisual(initialVolume * 100);

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
        const currentSlideElement = this.app.slides[this.app.currentSlide];
        if (
          currentSlideElement &&
          this.slideAudioEnabled &&
          this.app.currentSlide !== 10
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
    this.audioToggleBtn.style.transform = "rotate(180deg)";
  }

  hideAudioControls() {
    this.controlsVisible = false;
    this.audioControls.classList.add("hidden");
    this.audioToggleBtn.classList.remove("active");
    this.audioToggleBtn.style.transform = "rotate(0deg)";
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
      const currentSlideElement = this.app.slides[this.app.currentSlide];
      if (currentSlideElement && this.app.currentSlide !== 10) {
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

      // If autoplay is enabled and audio is disabled, start timer
      if (this.app.autoplayController && this.app.autoplayController.autoplayEnabled) {
        this.app.autoplayController.startAutoplayTimer();
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
    this.updateVolumeSliderVisual(value * 100);
  }

  updateVolumeSliderVisual(percentage) {
    this.volumeSlider.style.background = `linear-gradient(to right, #4ecdc4 0%, #4ecdc4 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`;
  }

  playSlideAudio(slideIndex) {
    // Don't play audio for slide 11 (index 10) - the "Thank You" slide
    if (!this.slideAudioEnabled || !this.hasUserInteracted || slideIndex === 10)
      return;

    const slide = this.app.slides[slideIndex];
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
}