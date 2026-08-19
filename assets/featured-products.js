(() => {
  const elementName = "featured-products";

  if (customElements.get(elementName)) {
    return;
  }

  class FeaturedProducts extends HTMLElement {
    constructor() {
      super();

      this.slider = null;
      this.controls = null;
      this.previousButton = null;
      this.nextButton = null;
      this.resizeObserver = null;
      this.abortController = null;
      this.recommendationsRequested = false;

      this.handlePreviousClick = this.handlePreviousClick.bind(this);
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handleSliderScroll = this.handleSliderScroll.bind(this);
      this.updateControls = this.updateControls.bind(this);
    }

    connectedCallback() {
      this.initializeSlider();
      this.loadRecommendations();
    }

    disconnectedCallback() {
      if (this.abortController) {
        this.abortController.abort();
      }

      this.destroySlider();
    }

    async loadRecommendations() {
      if (this.recommendationsRequested) {
        return;
      }

      const recommendationsUrl = this.dataset.recommendationsUrl;
      const sectionId = this.dataset.sectionId;
      const productId = this.dataset.productId;

      if (!recommendationsUrl || !sectionId || !productId) {
        return;
      }

      this.recommendationsRequested = true;
      this.abortController = new AbortController();
      this.setAttribute("aria-busy", "true");

      try {
        const response = await fetch(recommendationsUrl, {
          headers: {
            Accept: "text/html",
          },
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const responseText = await response.text();
        const responseDocument = new DOMParser().parseFromString(
          responseText,
          "text/html"
        );

        const updatedSection = responseDocument.getElementById(
          `FeaturedProducts-${sectionId}`
        );

        if (!updatedSection) {
          return;
        }

        this.destroySlider();
        this.innerHTML = updatedSection.innerHTML;
        this.dataset.productsCount =
          updatedSection.dataset.productsCount || "0";

        this.initializeSlider();
      } catch (error) {
        if (error.name !== "AbortError") {
          this.initializeSlider();
        }
      } finally {
        this.removeAttribute("aria-busy");
      }
    }

    initializeSlider() {
      this.destroySlider();

      this.slider = this.querySelector("[data-product-slider]");
      this.controls = this.querySelector("[data-slider-controls]");
      this.previousButton = this.querySelector("[data-slider-previous]");
      this.nextButton = this.querySelector("[data-slider-next]");

      if (!this.slider) {
        return;
      }

      if (this.previousButton) {
        this.previousButton.addEventListener(
          "click",
          this.handlePreviousClick
        );
      }

      if (this.nextButton) {
        this.nextButton.addEventListener("click", this.handleNextClick);
      }

      this.slider.addEventListener("scroll", this.handleSliderScroll, {
        passive: true,
      });

      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(this.updateControls);
        this.resizeObserver.observe(this.slider);
      } else {
        window.addEventListener("resize", this.updateControls);
      }

      requestAnimationFrame(this.updateControls);
    }

    destroySlider() {
      if (this.previousButton) {
        this.previousButton.removeEventListener(
          "click",
          this.handlePreviousClick
        );
      }

      if (this.nextButton) {
        this.nextButton.removeEventListener(
          "click",
          this.handleNextClick
        );
      }

      if (this.slider) {
        this.slider.removeEventListener(
          "scroll",
          this.handleSliderScroll
        );
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      window.removeEventListener("resize", this.updateControls);

      this.slider = null;
      this.controls = null;
      this.previousButton = null;
      this.nextButton = null;
      this.resizeObserver = null;
    }

    handlePreviousClick() {
      this.scrollSlider(-1);
    }

    handleNextClick() {
      this.scrollSlider(1);
    }

    handleSliderScroll() {
      this.updateControls();
    }

    scrollSlider(direction) {
      if (!this.slider) {
        return;
      }

      const firstSlide = this.slider.querySelector(
        ".featured-products__slide"
      );

      if (!firstSlide) {
        return;
      }

      const sliderStyles = window.getComputedStyle(this.slider);
      const sliderGap = Number.parseFloat(sliderStyles.gap) || 0;
      const slideWidth = firstSlide.getBoundingClientRect().width;
      const scrollDistance = slideWidth + sliderGap;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      this.slider.scrollBy({
        left: direction * scrollDistance,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }

    updateControls() {
      if (!this.slider) {
        return;
      }

      const maximumScroll =
        this.slider.scrollWidth - this.slider.clientWidth;
      const currentScroll = Math.max(this.slider.scrollLeft, 0);
      const hasOverflow = maximumScroll > 1;

      if (this.controls) {
        this.controls.classList.toggle(
          "featured-products__controls--hidden",
          !hasOverflow
        );
      }

      if (this.previousButton) {
        this.previousButton.disabled =
          !hasOverflow || currentScroll <= 1;
      }

      if (this.nextButton) {
        this.nextButton.disabled =
          !hasOverflow || currentScroll >= maximumScroll - 1;
      }
    }
  }

  customElements.define(elementName, FeaturedProducts);
})();