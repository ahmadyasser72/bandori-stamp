<script lang="ts">
  import { tick } from "svelte";

  import { room } from "./stamp-room.svelte";
  import { teleport } from "./utilities";

  let stampRoomConfig = $state<HTMLDialogElement>();
  let displayName = $state(room.self.displayName!);
  let badgeColor = $state(room.self.badgeColor);
</script>

<button
  onclick={() => stampRoomConfig!.showModal()}
  class="btn btn-outline btn-sm btn-circle"
  aria-label="Configure stamp room"
>
  <iconify-icon icon="line-md:cog-filled" width="20"></iconify-icon>
</button>
<dialog
  use:teleport={"body"}
  bind:this={stampRoomConfig}
  class="modal modal-bottom sm:modal-middle"
>
  <div class="modal-box grid sm:max-w-sm">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Display name</legend>

      <div class="join">
        <input
          bind:value={displayName}
          type="text"
          class="input join-item flex-1"
          required
        />

        <button
          onclick={() => {
            room.self.displayName = displayName;
            tick().then(() => stampRoomConfig!.close());
          }}
          class="btn btn-neutral join-item"
        >
          Set
        </button>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Badge color</legend>

      <div class="join">
        <input
          bind:value={badgeColor}
          type="color"
          class="input join-item w-16"
          required
        />
        <input
          value={badgeColor}
          type="text"
          class="input join-item flex-1"
          required
          readonly
        />

        <button
          onclick={() => {
            room.self.badgeColor = badgeColor;
            tick().then(() => stampRoomConfig!.close());
          }}
          class="btn btn-neutral join-item"
        >
          Set
        </button>
      </div>
    </fieldset>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
