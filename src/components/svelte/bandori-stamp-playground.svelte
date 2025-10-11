<script lang="ts">
  import type { Member, Stamp } from "~/content.config";
  import { getRandomItem } from "~/utilities";

  import BandoriStamp from "./bandori-stamp.svelte";
  import StampBrowser from "./stamp-browser.svelte";
  import StampRoomConfig from "./stamp-room-config.svelte";
  import { initializeRoom, room } from "./stamp-room.svelte";
  import { isFiltered } from "./state-filter.svelte";
  import { displayStamp, playground } from "./state-playground.svelte";
  import { loadStamp } from "./utilities";

  initializeRoom();
  let showRoomMemberList = $state(false);

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

    room.send(stamp);
    const loaded = await loadStamp(stamp);
    if (room.id === undefined) displayStamp(loaded);
    else displayStamp({ ...loaded, sender: room.self });
  };
</script>

{#if room.id}
  <div
    class="absolute top-1/3 left-1/2 grid -translate-x-1/2 -translate-y-1/2 items-center gap-2 px-4 sm:gap-x-4"
  >
    <h2 class="col-span-2 text-center text-xl font-medium">
      Room "{room.id}"
    </h2>
    <button
      onclick={() => (showRoomMemberList = !showRoomMemberList)}
      class={[
        "badge badge-lg badge-primary tooltip flex-1 font-medium",
        showRoomMemberList && "tooltip-open",
      ]}
    >
      <ul class="tooltip-content pointer-events-auto max-h-32 overflow-y-auto">
        {#each Object.entries(room.participants) as [key, { displayName }], idx}
          <li>
            {idx + 1} - {room.self.id === key
              ? `${displayName} (You)`
              : displayName}
          </li>
        {/each}
      </ul>

      {Object.keys(room.participants).length}
      <iconify-icon icon="line-md:person" width="20" class="-mr-1 -ml-2"
      ></iconify-icon>
      Active
    </button>

    <StampRoomConfig />
  </div>
{/if}

<div
  class={[
    "absolute top-1/2 left-1/2 flex -translate-x-1/2 flex-col gap-4 transition-transform",
    room.id ? "-translate-y-1/5" : "-translate-y-1/2",
  ]}
>
  <button onclick={() => showRandomStamp(false)} class="btn btn-accent"
    >{room.id ? "Send" : "Show"} Random</button
  >
  <button onclick={() => showRandomStamp(true)} class="btn btn-accent"
    >{room.id ? "Send" : "Show"} Random Voiced</button
  >

  <StampBrowser {members} {stamps} />
</div>

<div class="pointer-events-none absolute inset-0">
  {#each Object.values(playground.displayedStamps) as props (props.id)}
    <BandoriStamp {...props} />
  {/each}
</div>
