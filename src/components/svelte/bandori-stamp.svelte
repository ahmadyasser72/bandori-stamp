<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    image: string;
    audio: string | undefined;
    onremove: () => void;
  }

  const { image, audio, onremove }: Props = $props();

  let imgEl = $state<HTMLImageElement>();
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;

  let shouldRemove = $state(false);
  $effect(() => {
    if (shouldRemove && imgEl) {
      imgEl.addEventListener(
        "animationend",
        () => {
          URL.revokeObjectURL(image);
          if (audio) URL.revokeObjectURL(audio);
          onremove();
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
  <img bind:this={imgEl} src={image} alt="stamp" class:hide={shouldRemove} />
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
  .stamp > img {
    height: 165px;
    width: 200px;
  }

  .stamp > img {
    animation: bounceIn 0.75s forwards;

    &.hide {
      animation: bounceOut 0.75s forwards;
    }
  }
</style>
