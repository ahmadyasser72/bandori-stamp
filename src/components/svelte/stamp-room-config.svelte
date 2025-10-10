<script lang="ts">
  import { tick } from "svelte";

  import { room } from "./stamp-room.svelte";
  import { teleport } from "./utilities";

  let stampRoomConfig = $state<HTMLDialogElement>();
  let name = $state(room.displayName!);
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
  <div class="modal-box flex justify-center">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Display name</legend>

      <div class="join">
        <label class="input join-item">
          <input bind:value={name} type="text" required />
        </label>
        <button
          onclick={() => {
            room.displayName = name;
            tick().then(() => stampRoomConfig!.close());
          }}
          class="btn btn-neutral">Set</button
        >
      </div>
    </fieldset>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
