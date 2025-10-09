import * as devalue from "devalue";
import { settled } from "svelte";
import { persistedState } from "svelte-persisted-state";
import { SvelteSet } from "svelte/reactivity";

import type { Band, Member } from "~/content.config";

interface FilterState {
  bands: SvelteSet<string>;
  members: SvelteSet<string>;
}

export const filter = persistedState<FilterState>(
  "stamp-filter",
  {
    bands: new SvelteSet<string>(),
    members: new SvelteSet<string>(),
  },
  {
    serializer: {
      stringify: (value) =>
        devalue.stringify(value, {
          Set: (value: Set<never>) => value instanceof Set && [...value],
        }),
      parse: (text) =>
        devalue.parse(text, {
          Set: (value) => new SvelteSet(value),
        }),
    },
  },
);

export function toggleBandFilter(band: Band | "other", bandMembers: Member[]) {
  if (band === "other") {
    if (filter.current.bands.has(band)) filter.current.bands.delete(band);
    else filter.current.bands.add(band);
    return;
  }

  const flag = !filter.current.bands.has(band.id);
  const bandMemberIds = bandMembers.map(({ id }) => id);

  if (flag) {
    filter.current.bands.add(band.id);
    filter.current.members = new SvelteSet([
      ...filter.current.members,
      ...bandMemberIds,
    ]);
  } else {
    filter.current.bands.delete(band.id);
    filter.current.members = new SvelteSet(
      [...filter.current.members].filter((id) => !bandMemberIds.includes(id)),
    );

    settled().then(() => scrollToMember(bandMemberIds[0] ?? ""));
  }
}
export function toggleMemberFilter(member: Member, bandMembers: Member[]) {
  const flag = !filter.current.members.has(member.id);

  if (flag) {
    filter.current.members.add(member.id);
    filter.current.bands.add(member.band.id);
  } else {
    filter.current.members.delete(member.id);
    settled().then(() => scrollToMember(member.id));

    if (bandMembers.every((it) => !filter.current.members.has(it.id)))
      filter.current.bands.delete(member.band.id);
  }
}

export const scrollToMember = (memberId: string) => {
  document
    .querySelector(`[data-member-id="${memberId}"]`)
    ?.scrollIntoView({ behavior: "instant" });
};
export const isFiltered = (memberId: string, members: Member[]) => {
  return (
    filter.current.members.has(memberId) ||
    (filter.current.bands.has("other") &&
      !members.map(({ id }) => id).includes(memberId))
  );
};
