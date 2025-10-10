<script lang="ts">
  import { onMount } from "svelte";

  import { playground } from "./state-playground.svelte";

  interface Props {
    id: string;
    image: string;
    audio: string | undefined;
    sender?: string;
  }

  const { id, image, audio, sender }: Props = $props();

  let animatingEl = $state<HTMLElement>();
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;

  let shouldRemove = $state(false);
  $effect(() => {
    if (shouldRemove && animatingEl) {
      animatingEl.addEventListener(
        "animationend",
        () => {
          URL.revokeObjectURL(image);
          if (audio) URL.revokeObjectURL(audio);
          delete playground.displayedStamps[id];
        },
        { once: true },
      );
    }
  });

  onMount(() => {
    if (audio) {
      const sound = new Audio(audio);
      sound.addEventListener("ended", () => sound.remove());
      sound.play();
    }

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => (shouldRemove = true), 5000);
    return () => {
      clearTimeout(timeout);
    };
  });
</script>

<div
  class="stamp pointer-events-none absolute z-1000 origin-top-left select-none"
  style:left="{randomX}%"
  style:top="{randomY}%"
  style:transform="translate({-randomX}%, {-randomY}%)"
>
  <div bind:this={animatingEl} class="stamp-content" class:hide={shouldRemove}>
    <img src={image} alt="stamp" />

    {#if sender}
      <span
        class="badge badge-soft badge-accent absolute inset-x-0 -bottom-4 w-full"
      >
        {sender}
      </span>
    {/if}
  </div>
</div>

<style>
  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    20% {
      transform: scale(1.02);
      opacity: 1;
    }
    40% {
      transform: scale(0.9);
    }
    60% {
      transform: scale(1.03);
    }
    80% {
      transform: scale(0.97);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounceOut {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    20% {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1.03);
      opacity: 1;
    }
    100% {
      transform: scale(0.3);
      opacity: 0;
    }
  }

  .stamp,
  .stamp > .stamp-content {
    height: 165px;
    width: 200px;
  }

  .stamp > .stamp-content {
    animation: bounceIn 0.75s forwards;

    &.hide {
      animation: bounceOut 0.75s forwards;
    }
  }
</style>
