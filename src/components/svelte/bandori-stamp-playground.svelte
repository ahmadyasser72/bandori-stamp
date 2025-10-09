<script lang="ts">
  import type { Member, Stamp } from "~/content.config";
  import { getRandomItem } from "~/utilities";

  import BandoriStamp from "./bandori-stamp.svelte";
  import StampBrowser from "./stamp-browser.svelte";
  import { isFiltered } from "./state-filter.svelte";
  import { displayStamp, playground } from "./state-playground.svelte";
  import { loadStamp } from "./utilities";

  interface Props {
    members: Member[];
    stamps: Stamp[];
  }

  const { members, stamps }: Props = $props();
  const voicedStamps = $derived(stamps.filter(({ voiced }) => voiced));

  const showRandomStamp = async (voiced: boolean) => {
    const stamp = getRandomItem(
      (voiced ? voicedStamps : stamps).filter(
        (stamp) => !isFiltered(stamp.stampId.slice(6, 9), members),
      ),
    );
    const { image, audio } = await loadStamp(stamp);
    displayStamp({ id: crypto.randomUUID(), image, audio });
  };
</script>

<div
  class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4"
>
  <button onclick={() => showRandomStamp(false)} class="btn btn-accent"
    >Show Random</button
  >
  <button onclick={() => showRandomStamp(true)} class="btn btn-accent"
    >Show Random Voiced</button
  >

  <StampBrowser {members} {stamps} />
</div>

<div class="pointer-events-none absolute inset-0">
  {#each playground.displayedStamps as { id, image, audio }, idx (id)}
    <BandoriStamp
      {image}
      {audio}
      onremove={() => playground.displayedStamps.splice(idx, 1)}
    />
  {/each}
</div>
