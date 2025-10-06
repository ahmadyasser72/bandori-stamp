import type { LoadedStamp } from "~/utilities";

import styles from "./bandori-stamp.module.css";

export class BandoriStamp extends HTMLElement {
  static stampContainer: BandoriStampContainer;
  static initialize(overlay: BandoriStampContainer) {
    this.stampContainer = overlay;
    if (customElements.get("bandori-stamp") === undefined)
      customElements.define("bandori-stamp", this);
  }

  static show(stamp: LoadedStamp) {
    this.stampContainer.appendChild(new BandoriStamp(stamp));
  }

  stamp: LoadedStamp;
  constructor(stamp: LoadedStamp) {
    super();

    this.stamp = stamp;

    this.className = `absolute transform-origin-top-left ${styles.stamp}`;
    const [randomX, randomY] = [Math.random() * 100, Math.random() * 100];
    this.style.left = randomX + "%";
    this.style.top = randomY + "%";
    this.style.transform = `translate(${randomX * -1}%, ${randomY * -1}%)`;
  }

  connectedCallback() {
    this.appendChild(this.stamp.image);
    if (this.stamp.audio !== undefined) {
      this.stamp.audio.play();
    }

    // self remove after 5s
    setTimeout(() => {
      // start hide animation
      this.stamp.image.className = styles.hide!;
      // then self remove after animation is done
      this.stamp.image.addEventListener(
        "animationend",
        () => BandoriStamp.stampContainer.removeChild(this),
        { once: true },
      );
    }, 5000);
  }
}

export class BandoriStampContainer extends HTMLElement {
  static initialize() {
    if (customElements.get("bandori-stamp-container") === undefined)
      customElements.define("bandori-stamp-container", this);
  }

  constructor() {
    super();

    this.className = "pointer-events-none absolute inset-0 select-none";
  }

  connectedCallback() {
    BandoriStamp.initialize(this);
  }
}
