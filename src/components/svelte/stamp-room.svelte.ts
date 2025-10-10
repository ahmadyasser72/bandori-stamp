import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/client";
import { onMount } from "svelte";

import type { Stamp } from "~/content.config";

import { displayStamp } from "./state-playground.svelte";
import { loadStamp } from "./utilities";

export const room = $state<{
  client?: SupabaseClient;
  channel?: RealtimeChannel;

  id?: string;
  displayName?: string;
  participants: Record<string, string>;

  send: (stamp: Stamp) => void;
}>({
  participants: {},
  send(stamp) {
    if (!this.channel) return;

    this.channel.send({ type: "broadcast", event: "stamp", payload: stamp });
  },
});

export const initializeRoom = () => {
  onMount(() => {
    const id = new URL(document.URL).searchParams.get("room") ?? undefined;
    if (id === undefined) return;

    room.displayName = localStorage.getItem("stamp-room-display-name") ?? "";

    room.id = id;
    room.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    room.channel = room.client.channel(room.id);

    room.channel
      .on("broadcast", { event: "stamp" }, (stamp) =>
        loadStamp(stamp.payload).then(displayStamp),
      )
      .on("presence", { event: "sync" }, () => {
        room.participants = Object.fromEntries(
          Object.entries(room.channel!.presenceState<{ name: string }>()).map(
            ([key, values]) => [key, values.at(-1)!.name],
          ),
        );
      })
      .subscribe();
  });

  $effect(() => {
    if (room.displayName && room.channel) {
      room.channel.track({ name: room.displayName });
      localStorage.setItem("stamp-room-display-name", room.displayName);
    }
  });
};
