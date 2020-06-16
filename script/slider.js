class Carousel {
  static $id = 0;

  static classes = {
    first: 'gallery-item-first',
    previous: 'gallery-item-previous',
    selected: 'gallery-item-selected',
    next: 'gallery-item-next',
    last: 'gallery-item-last',
    controls: {
      prev: 'gallery-controls-previous',
      next: 'gallery-controls-next'
    },
    createClass: str => `.${str}`
  }

  constructor(container, items, controls = ['previous', 'next']) {
    this.carouselContainer = container;
    this.carouselControls = controls;
    this.carouselArray = [...items];
    this.slideTimer = null;
    this.state = 0;
    this.setSliderVersion(this.carouselArray.length);
    this.$id = ++Carousel.$id;
    
    this.carouselContainer.setAttribute('data-carousel-id', this.$id);
    this.carouselArray.forEach((item, index) => {
      item.setAttribute('data-slide-index', index);

      this.applyReadmore(`[data-carousel-id="${this.$id}"] [data-slide-index="${index}"] .gallery-item-dropdown-text`);
    });
    
    this.setExpandLogic();
  }

  applyReadmore(target) {
    window.applyReadmore({
      target,
      numOfWords: 10,
    });
  }

  setExpandLogic() {
    this.carouselContainer.addEventListener('click', e => {
      if (e.target.nodeName === 'A' && e.target.classList.contains('readmore-link')) {
        const wrapper = '.gallery-item-image-wrapper';
        const slide = e.target.closest(wrapper);
        const expanded = slide.querySelector('.gallery-item-dropdown-expanded');

        const text = slide.querySelector('.gallery-item-dropdown-text');
        const content = slide.querySelector('.gallery-item-ads-text');

        if (content) {
          setTimeout(() => {
            content.appendChild(text);

            slide.querySelector('.gallery-item-dropdown').innerHTML = '';

            expanded.classList.add('open');

            this.pauseAutoSlide();

            e.target.remove();
          });
        }
      }

      if (e.target.classList.contains('gallery-btn-close')) {
        const wrapper = '.gallery-item-image-wrapper';
        const slide = e.target.closest(wrapper);
        const expanded = slide.querySelector('.gallery-item-dropdown-expanded');

        expanded.classList.remove('open');

        this.addAutoSlide();

        const text = slide.querySelector('.gallery-item-ads-text .gallery-item-dropdown-text');
        const content = slide.querySelector('.gallery-item-dropdown');

        if (content) {
          content.appendChild(text);

          const gallerySlide = slide.closest('[data-slide-index]');
          const slideId = gallerySlide.dataset.slideIndex;

          this.applyReadmore(`[data-carousel-id="${this.$id}"] [data-slide-index="${slideId}"] .gallery-item-dropdown-text`);
        }
      }
    });
  }

  setSliderVersion(numberOfElements) {
    if (numberOfElements < 3 || numberOfElements === 4) {
      throw new Error(`Please set 3 or more than 5 images! Current number of elements -> ${numberOfElements}`)
    }

    if (numberOfElements === 3) {
      this.classesSequence = [Carousel.classes.previous, Carousel.classes.selected, Carousel.classes.next];
    }

    if (numberOfElements >= 5) {
      this.classesSequence = [Carousel.classes.first, Carousel.classes.previous, Carousel.classes.selected, Carousel.classes.next, Carousel.classes.last];
    }
  }

  slideIndexOf(element) {
    return this.carouselArray.findIndex(el => el === element);
  }

  getElements(itemIndex) {
    const prev = this.carouselArray[itemIndex - 1] || this.carouselArray[this.carouselArray.length - 1] || null;
    const prevIndex = this.slideIndexOf(prev);
    const first = this.carouselArray[prevIndex - 1] || this.carouselArray[this.carouselArray.length - 1];

    const active = this.carouselArray[itemIndex] || null;

    const next = this.carouselArray[itemIndex + 1] || this.carouselArray[0] || null;
    const nextIndex = this.slideIndexOf(next);
    const last = this.carouselArray[nextIndex + 1] || this.carouselArray[0] || null;

    if (this.classesSequence.length === 3) {
      return [prev, active, next];
    }

    if (this.classesSequence.length === 5) {
      return [first, prev, active, next, last];
    }
  }

  setState() {
    const { classesSequence } = this;
    const elements = this.getElements(this.state);

    this.carouselArray.forEach(item => {
      item.classList.add('d-none');

      const closeBtn = item.querySelector('.gallery-btn-close');
      const wrapper = item.querySelector('.gallery-item-dropdown-expanded.open');

      wrapper && closeBtn && closeBtn.click();

      classesSequence.forEach(clazz => {
        item.classList.remove(clazz);
      });
    });

    classesSequence.forEach((clazz, index) => {
      elements[index].classList.add(clazz);
      elements[index].classList.remove('d-none');
    });
  }

  prevSlide() {
    const current = this.state;

    if (current > 0) {
      this.state = current - 1;
    } else {
      this.state = this.carouselArray.length - 1;
    }

    this.setState(this.state);
  }

  nextSlide() {
    const current = this.state;

    if (current >= this.carouselArray.length - 1) {
      this.state = 0;
    } else {
      this.state = current + 1;
    }

    this.setState(this.state);
  }

  setNav() {
    galleryContainer.appendChild(document.createElement('ul')).className = 'gallery-nav';

    this.carouselArray.forEach(item => {
      const nav = galleryContainer.lastElementChild;
      nav.appendChild(document.createElement('li'));
    });
  }

  setControls() {
    this.carouselControls.forEach(control => {
      const btn = document.createElement('span');

      galleryControlsContainer.appendChild(btn).className = `gallery-controls-${control}`;

      btn.setAttribute('data-direction', control);
    });

    !!galleryControlsContainer.childNodes[0] ? galleryControlsContainer.childNodes[0].innerHTML = `<i class="fa fa-chevron-left" aria-hidden="true"></i>` : null;
    !!galleryControlsContainer.childNodes[1] ? galleryControlsContainer.childNodes[1].innerHTML = `<i class="fa fa-chevron-right" aria-hidden="true"></i>` : null;

    this.galleryControlsButtons = [
      galleryControlsContainer.childNodes[0],
      galleryControlsContainer.childNodes[1]
    ].filter(Boolean);
  }

  useControls() {
    const triggers = [...this.galleryControlsButtons];

    triggers.forEach(control => {
      control.addEventListener('click', () => {
        const target = control;

        if (this.slideTimer) {
          this.pauseAutoSlide();
          this.addAutoSlide();
        }

        target.dataset.direction === 'next' ? this.nextSlide() : this.prevSlide();
      });
    });
  }

  pauseAutoSlide() {
    clearTimeout(this.slideTimer);
    this.slideTimer = null;
  }

  addAutoSlide({ stopTime = this.stopTime, direction = this.direction } = {}) {
    this.stopTime = stopTime;
    this.direction = direction;

    this.slideTimer = setInterval(() => {
      const [left, right] = this.galleryControlsButtons;

      this.setState(direction === 'left' ? this.prevSlide() : this.nextSlide());
    }, stopTime);
  }
}
