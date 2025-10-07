import { base } from "astro:config/client";

import type { Stamp } from "~/content.config";

import styles from "./bandori-stamp.module.css";

export class BandoriStamp extends HTMLElement {
  static stampContainer: HTMLElement;
  static initialize(container: HTMLElement) {
    this.stampContainer = container;
    if (customElements.get("bandori-stamp") === undefined)
      customElements.define("bandori-stamp", this);
  }

  static async show(stamp: Stamp) {
    const loaded = await loadStamp(stamp);
    this.stampContainer.appendChild(new BandoriStamp(loaded));
  }

  stamp: LoadedStamp;
  constructor(stamp: LoadedStamp) {
    super();

    this.stamp = stamp;

    this.className = styles.stamp!;
    const [randomX, randomY] = [Math.random() * 100, Math.random() * 100];
    this.style.left = randomX + "%";
    this.style.top = randomY + "%";
    this.style.transform = `translate(${randomX * -1}%, ${randomY * -1}%)`;
  }

  connectedCallback() {
    const img = new Image();
    img.src = this.stamp.image;
    this.appendChild(img);

    if (this.stamp.audio !== undefined) {
      const audio = new Audio(this.stamp.audio);
      audio.addEventListener("ended", () => audio.remove());
      audio.play();
    }

    // self remove after 5s
    setTimeout(() => {
      // start hide animation
      img.className = styles.hide!;
      // then self remove after animation is done
      img.addEventListener(
        "animationend",
        () => {
          // cleanup image blob url first before removing
          URL.revokeObjectURL(this.stamp.image);
          this.remove();

          // then cleanup audio blob url
          if (this.stamp.audio !== undefined)
            URL.revokeObjectURL(this.stamp.audio);
        },
        { once: true },
      );
    }, 5000);
  }
}

export type LoadedStamp = Awaited<ReturnType<typeof loadStamp>>;
export const loadStamp = async ({ id, stampId, region, voiced }: Stamp) => {
  const basePath = `${base}/static/${region}.${stampId}/stamp`;
  const [image, audio] = [`${basePath}.png`, `${basePath}.mp3`];

  return Promise.all([
    fetch(image)
      .then((response) => response.blob())
      .then(URL.createObjectURL),
    !voiced
      ? Promise.resolve(undefined)
      : fetch(audio)
          .then((response) => response.blob())
          .then(URL.createObjectURL),
  ]).then(([image, audio]) => ({ id, image, audio }));
};
