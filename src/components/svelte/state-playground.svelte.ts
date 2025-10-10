import type { ComponentProps } from "svelte";

import type BandoriStamp from "./bandori-stamp.svelte";

interface PlaygroundState {
  displayedStamps: Record<string, ComponentProps<typeof BandoriStamp>>;
}

export const playground = $state<PlaygroundState>({
  displayedStamps: {},
});

export function displayStamp(stamp: ComponentProps<typeof BandoriStamp>) {
  playground.displayedStamps[stamp.id] = stamp;
}
