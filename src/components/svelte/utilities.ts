import { base } from "astro:config/client";
import type { Action } from "svelte/action";
import type { Attachment } from "svelte/attachments";

import type { Stamp } from "~/content.config";

export const intersect = (handler: () => Promise<void>): Attachment => {
  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (isIntersecting && target instanceof HTMLElement) {
        observer.unobserve(target);
        observer.disconnect();
        handler();
      }
    }
  });

  return (node) => {
    observer.observe(node);
  };
};
export const teleport: Action<HTMLElement, string> = (node, selector) => {
  const target = document.querySelector(selector);
  if (target) target.appendChild(node);
};

export const loadStamp = async (stamp: Stamp) =>
  Promise.all([loadStampAudio(stamp), loadStampImage(stamp)]).then(
    ([audio, image]) => ({ id: crypto.randomUUID(), image, audio }),
  );

export const loadStampImage = async (
  stamp: Pick<Stamp, "stampId" | "region">,
) => {
  const { image } = getStampAssetUrl(stamp);

  const response = await fetch(image);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
export const loadStampAudio = async (
  stamp: Pick<Stamp, "stampId" | "region" | "voiced">,
) => {
  if (!stamp.voiced) return;
  const { audio } = getStampAssetUrl(stamp);

  const response = await fetch(audio);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const getStampAssetUrl = ({
  stampId,
  region,
}: Pick<Stamp, "stampId" | "region">) => {
  const basePath = `${base}/static/${region}/${stampId}`;
  return { image: `${basePath}.png`, audio: `${basePath}.mp3` };
};
