<script lang="ts">
  import { base } from "astro:config/client";

  import type { Member, Stamp } from "~/content.config";

  import StampBrowserItem from "./stamp-browser-item.svelte";
  import {
    filter,
    isFiltered,
    scrollToMember,
    toggleBandFilter,
    toggleMemberFilter,
  } from "./state-filter.svelte";
  import { teleport } from "./utilities";

  interface Props {
    members: Member[];
    stamps: Stamp[];
  }

  const { members, stamps }: Props = $props();
  let stampBrowser = $state<HTMLDialogElement>();
  let stampBrowserFilter = $state<HTMLElement>();

  const bands = $derived(
    members.map(({ band }) => band).filter((_, idx) => idx % 5 === 0),
  );
  const membersByBand = $derived(
    members.reduce(
      (acc, next) => {
        acc[next.band.id] ??= [];
        acc[next.band.id]!.push(next);
        return acc;
      },
      {} as Record<string, Member[]>,
    ),
  );
</script>

<button onclick={() => stampBrowser!.show()} class="btn btn-accent">
  Browse Stamps
</button>

<dialog
  use:teleport={"body"}
  bind:this={stampBrowser}
  class="modal modal-bottom sm:modal-middle"
>
  <div class="modal-box relative !container scroll-pt-32">
    <form method="dialog" class="contents">
      <button
        class="btn btn-outline bg-base-100 sticky top-0 z-10 mb-2 w-full text-lg sm:text-xl"
        >Close</button
      >
    </form>

    <button
      popovertarget="stamp-browser-filter"
      class="btn btn-accent sticky top-12 z-10 mb-4 w-full text-lg sm:text-xl"
      style="anchor-name: --stamp-browser-filter-anchor;"
    >
      Filter Stamp

      <iconify-icon icon="lucide:funnel" width="20"></iconify-icon>
    </button>
    <div
      bind:this={stampBrowserFilter}
      id="stamp-browser-filter"
      class="dropdown dropdown-end rounded-box bg-base-100 mt-2 h-64 w-4/5 overflow-y-auto border px-4 py-2 shadow-sm sm:w-96"
      popover="hint"
      style="position-anchor: --stamp-browser-filter-anchor;"
    >
      <div class="flex flex-wrap gap-4">
        {#each bands as band (band.id)}
          <div class="flex flex-wrap gap-2">
            <div class="join w-full items-center">
              <label
                for="filter-band-{band.id}"
                class={[
                  "btn btn-sm sm:btn-md join-item flex-1",
                  filter.current.bands.has(band.id)
                    ? "btn-outline"
                    : "btn-primary",
                ]}
              >
                <input
                  oninput={() =>
                    toggleBandFilter(band, membersByBand[band.id]!)}
                  id="filter-band-{band.id}"
                  value={band.id}
                  class="hidden"
                  type="checkbox"
                  name="band"
                />

                {band.name}
              </label>
              <button
                onclick={() => {
                  scrollToMember(membersByBand[band.id]?.[0]?.id!);
                  stampBrowserFilter!.hidePopover();
                }}
                class="btn btn-sm sm:btn-md join-item btn-outline"
              >
                <img
                  src="{base}/static/bands/{band.id}-logo.png"
                  alt="{band.name} logo"
                  class="h-8"
                />
              </button>
            </div>

            {#each membersByBand[band.id]! as member (member.id)}
              <div class="join items-center">
                <button
                  onclick={() => {
                    scrollToMember(member.id);
                    stampBrowserFilter!.hidePopover();
                  }}
                  class="btn btn-xs sm:btn-sm btn-square btn-outline"
                >
                  <img
                    src="{base}/static/member/{member.id}-icon.png"
                    alt="{member.name} icon"
                    class=" size-4 sm:size-6"
                  />
                </button>
                <label
                  for="filter-member-{member.id}"
                  class={[
                    "btn btn-xs sm:btn-sm rounded-r-box",
                    filter.current.members.has(member.id)
                      ? "btn-outline"
                      : "btn-primary",
                  ]}
                >
                  <input
                    oninput={() => toggleMemberFilter(member, members)}
                    id="filter-member-{member.id}"
                    value={member.id}
                    class="hidden"
                    type="checkbox"
                    name="member"
                  />

                  {member.name}
                </label>
              </div>
            {/each}
          </div>
        {/each}

        <label
          for="filter-band-other"
          class={[
            "btn btn-sm sm:btn-md w-full",
            filter.current.bands.has("other") ? "btn-outline" : "btn-primary",
          ]}
        >
          <input
            oninput={() => toggleBandFilter("other", [])}
            id="filter-band-other"
            value="other"
            class="hidden"
            type="checkbox"
            name="band"
          />

          <span>Other</span>
        </label>
      </div>
    </div>

    <ul
      class="grid min-h-64 grid-cols-2 place-items-center gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {#each stamps as stamp (stamp.id)}
        {@const memberId = stamp.stampId.slice(6, 9)}
        <StampBrowserItem
          {memberId}
          {stamp}
          visible={!isFiltered(memberId, members)}
        />
      {/each}
    </ul>
  </div>
</dialog>
