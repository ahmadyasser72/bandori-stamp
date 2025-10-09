import type { ComponentProps } from "svelte";

import type BandoriStamp from "./bandori-stamp.svelte";

type StampData = Omit<ComponentProps<typeof BandoriStamp>, "onremove"> & {
  id: string;
};
interface PlaygroundState {
  displayedStamps: StampData[];
}

export const playground = $state<PlaygroundState>({
  displayedStamps: [] as StampData[],
});

export function displayStamp(stamp: StampData) {
  playground.displayedStamps.push(stamp);
}
