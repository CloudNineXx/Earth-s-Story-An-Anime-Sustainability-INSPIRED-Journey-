// visualEffectsController.js - Visual Effects Module
// Handles parallax effects, animations, custom cursor, and intersection observer

class VisualEffectsController {
  constructor(app) {
    this.app = app;
    this.customCursor = document.getElementById("custom-cursor");
  }

  setupParallax() {
    this.app.slidesContainer.addEventListener("scroll", () => {
      const scrolled = this.app.slidesContainer.scrollTop;

      this.app.slides.forEach((slide, index) => {
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

          this.app.updateCurrentSlide(entry.target);
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

    this.app.slides.forEach((slide) => {
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
}