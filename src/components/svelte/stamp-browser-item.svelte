<script lang="ts">
  import { onDestroy } from "svelte";

  import type { Stamp } from "~/content.config";

  import { displayStamp } from "./state-playground.svelte";
  import { getStampAssetUrl, loadStampAudio } from "./utilities";
  import { intersect } from "./utilities";

  interface Props {
    memberId: string;
    stamp: Stamp;
    visible: boolean;
  }

  const { memberId, stamp, visible }: Props = $props();
  const { image } = $derived(getStampAssetUrl(stamp));

  let audioUrl = $state<string>();
  onDestroy(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  });
</script>

{#if visible}
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
      onclick={() =>
        displayStamp({
          id: crypto.randomUUID(),
          audio: audioUrl,
          image,
        })}
      class="btn btn-circle btn-soft btn-accent absolute right-0 bottom-0 size-12"
      aria-label="Play {stamp.id} audio"
    >
      <iconify-icon
        icon={audioUrl ? "lucide:volume-2" : "lucide:play"}
        width="24"
      >
      </iconify-icon>
    </button>
  </li>
{/if}
