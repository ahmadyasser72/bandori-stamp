import { base } from "astro:config/client";

import type { Stamp } from "~/content.config";

export const getRandomItem = <T>(array: T[]) =>
  array[Math.floor(Math.random() * array.length)]!;

export type LoadedStamp = Awaited<ReturnType<typeof loadStamp>>;
export const loadStamp = async ({ id, stampId, region, voiced }: Stamp) => {
  const basePath = `${base}/static/${region}.${stampId}/stamp`;

  return Promise.all([
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = `${basePath}.png`;

      if (img.complete) return resolve(img);
      img.addEventListener("load", () => resolve(img), { once: true });
    }),
    !voiced
      ? Promise.resolve(undefined)
      : new Promise<HTMLAudioElement>((resolve) => {
          const audio = new Audio(`${basePath}.mp3`);

          if (audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
            return resolve(audio);

          audio.addEventListener("canplaythrough", () => resolve(audio), {
            once: true,
          });
        }),
  ]).then(([image, audio]) => ({ id, image, audio }));
};
