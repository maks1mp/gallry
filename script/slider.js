class Carousel {
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

    this.carouselArray
      .filter(item => !!item.querySelector('.gallery-item-popup'))
      .forEach(item => {
        item.addEventListener('click', event => {
          const notPopup = !(event.target.classList.contains('gallery-item-popup') || event.target.closest('.gallery-item-popup'));
          const notReadmore = !(event.target.classList.contains('gallery-item-description') || event.target.closest('.gallery-item-description'));

          if (notPopup && notReadmore) {
            item.querySelector('.gallery-item-popup').classList.toggle('open');
          }
        });

        item.querySelector('[data-action="close"]').addEventListener('click', e => {
          e.preventDefault();
          item.querySelector('.gallery-item-popup').classList.remove('open');
        });
      });
  }

  // Assign initial css classes for gallery and nav items
  setInitialState() {
    this.carouselArray[0].classList.add(Carousel.classes.first);
    this.carouselArray[1].classList.add(Carousel.classes.previous);
    this.carouselArray[2].classList.add(Carousel.classes.selected);
    this.carouselArray[3].classList.add(Carousel.classes.next);
    this.carouselArray[4].classList.add(Carousel.classes.last);

    // document.querySelector('.gallery-nav').childNodes[0].className = 'gallery-nav-item gallery-item-first';
    // document.querySelector('.gallery-nav').childNodes[1].className = 'gallery-nav-item gallery-item-previous';
    // document.querySelector('.gallery-nav').childNodes[2].className = 'gallery-nav-item gallery-item-selected';
    // document.querySelector('.gallery-nav').childNodes[3].className = 'gallery-nav-item gallery-item-next';
    // document.querySelector('.gallery-nav').childNodes[4].className = 'gallery-nav-item gallery-item-last';
  }

  // Update the order state of the carousel with css classes
  setCurrentState(target) {
    const selected = document.querySelectorAll(Carousel.classes.createClass(Carousel.classes.selected));
    const previous = document.querySelectorAll(Carousel.classes.createClass(Carousel.classes.previous));
    const next = document.querySelectorAll(Carousel.classes.createClass(Carousel.classes.next));
    const first = document.querySelectorAll(Carousel.classes.createClass(Carousel.classes.first));
    const last = document.querySelectorAll(Carousel.classes.createClass(Carousel.classes.last));

    selected.forEach(el => {
      el.classList.remove(Carousel.classes.selected);

      if (target.className == Carousel.classes.controls.prev) {
        el.classList.add(Carousel.classes.next);
      } else {
        el.classList.add(Carousel.classes.previous);
      }
    });

    previous.forEach(el => {
      el.classList.remove(Carousel.classes.previous);

      if (target.className == Carousel.classes.controls.prev) {
        el.classList.add(Carousel.classes.selected);
      } else {
        el.classList.add(Carousel.classes.first);
      }
    });

    next.forEach(el => {
      el.classList.remove(Carousel.classes.next);

      if (target.className == Carousel.classes.controls.prev) {
        el.classList.add(Carousel.classes.last);
      } else {
        el.classList.add(Carousel.classes.selected);
      }
    });

    first.forEach(el => {
      el.classList.remove(Carousel.classes.first);

      if (target.className == Carousel.classes.controls.prev) {
        el.classList.add(Carousel.classes.previous);
      } else {
        el.classList.add(Carousel.classes.last);
      }
    });

    last.forEach(el => {
      el.classList.remove(Carousel.classes.last);

      if (target.className == Carousel.classes.controls.prev) {
        el.classList.add(Carousel.classes.first);
      } else {
        el.classList.add(Carousel.classes.next);
      }
    });
  }

  // Construct the carousel navigation
  setNav() {
    galleryContainer.appendChild(document.createElement('ul')).className = 'gallery-nav';

    this.carouselArray.forEach(item => {
      const nav = galleryContainer.lastElementChild;
      nav.appendChild(document.createElement('li'));
    });
  }

  // Construct the carousel controls
  setControls() {
    this.carouselControls.forEach(control => {
      galleryControlsContainer.appendChild(document.createElement('span')).className = `gallery-controls-${control}`;
    });

    !!galleryControlsContainer.childNodes[0] ? galleryControlsContainer.childNodes[0].innerHTML = `<i class="fa fa-chevron-left" aria-hidden="true"></i>` : null;
    !!galleryControlsContainer.childNodes[1] ? galleryControlsContainer.childNodes[1].innerHTML = `<i class="fa fa-chevron-right" aria-hidden="true"></i>` : null;

    this.galleryControlsButtons = [
      galleryControlsContainer.childNodes[0],
      galleryControlsContainer.childNodes[1]
    ].filter(Boolean);
  }

  // Add a click event listener to trigger setCurrentState method to rearrange carousel
  useControls() {
    const triggers = [...this.galleryControlsButtons];

    triggers.forEach(control => {
      control.addEventListener('click', () => {
        const target = control;

        if (this.slideTimer) {
          this.pauseAutoSlide();
          this.addAutoSlide();
        }

        Array.from(this.carouselContainer.querySelectorAll('.gallery-item-popup.open'))
          .filter(Boolean)
          .forEach(item => item.classList.remove('open'));

        this.setCurrentState(target);
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

      this.setCurrentState(direction === 'left' ? left : right);
    }, stopTime);
  }
}
