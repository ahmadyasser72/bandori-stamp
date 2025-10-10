<script lang="ts">
  import { onDestroy } from "svelte";

  import type { Stamp } from "~/content.config";

  import { room } from "./stamp-room.svelte";
  import { displayStamp } from "./state-playground.svelte";
  import { getStampAssetUrl, loadStampAudio } from "./utilities";
  import { intersect } from "./utilities";

  interface Props {
    memberId: string;
    stamp: Stamp;
  }

  const { memberId, stamp }: Props = $props();
  const { image } = $derived(getStampAssetUrl(stamp));

  let audioUrl = $state<string>();
  onDestroy(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  });
</script>

<li
  data-member-id={memberId}
  class="relative select-none"
  {@attach stamp.voiced &&
    intersect(async () => {
      audioUrl = (await loadStampAudio(stamp))!;
    })}
>
  <img
    src={image}
    alt="{stamp.id}.png"
    loading="lazy"
    height="165px"
    width="200px"
  />

  <button
    onclick={() => {
      room.send(stamp);
      displayStamp({
        id: crypto.randomUUID(),
        audio: audioUrl,
        image,
      });
    }}
    class={[
      "btn btn-circle btn-soft btn-accent swap swap-flip absolute right-0 bottom-0 size-12",
      audioUrl && "swap-active",
    ]}
    aria-label="Play {stamp.id} audio"
  >
    <iconify-icon class="swap-on" icon="line-md:volume-high" width="32">
    </iconify-icon>
    <iconify-icon class="swap-off" icon="line-md:play" width="32">
    </iconify-icon>
  </button>
</li>
