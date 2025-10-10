<script lang="ts">
  import type { Member, Stamp } from "~/content.config";
  import { getRandomItem } from "~/utilities";

  import BandoriStamp from "./bandori-stamp.svelte";
  import StampBrowser from "./stamp-browser.svelte";
  import { joinRoom } from "./stamp-room.svelte";
  import { isFiltered } from "./state-filter.svelte";
  import { displayStamp, playground } from "./state-playground.svelte";
  import { loadStamp } from "./utilities";

  interface Props {
    members: Member[];
    stamps: Stamp[];
  }

  const { members, stamps }: Props = $props();
  const voicedStamps = $derived(stamps.filter(({ voiced }) => voiced));

  const room = joinRoom();
  const roomId = $derived(room.state.id);
  const showRandomStamp = async (voiced: boolean) => {
    const stamp = getRandomItem(
      (voiced ? voicedStamps : stamps).filter(
        (stamp) => !isFiltered(stamp.stampId.slice(6, 9), members),
      ),
    );

    room.send(stamp);
    const loaded = await loadStamp(stamp);
    displayStamp(loaded);
  };
</script>

<div
  class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4"
>
  {#if roomId}
    <h2 class="mb-1 text-center font-semibold">
      Room: <span class="underline">{roomId}</span>
    </h2>
  {/if}

  <button onclick={() => showRandomStamp(false)} class="btn btn-accent"
    >{roomId ? "Send" : "Show"} Random</button
  >
  <button onclick={() => showRandomStamp(true)} class="btn btn-accent"
    >{roomId ? "Send" : "Show"} Random Voiced</button
  >

  <StampBrowser {members} {stamps} onStampPlay={room.send} />
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
