import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/client";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";

import type { Stamp } from "~/content.config";

import { displayStamp } from "./state-playground.svelte";
import { loadStamp } from "./utilities";

export const room = $state<{
  client?: SupabaseClient;
  channel?: RealtimeChannel;

  id?: string;
  displayName: string;
  presenceId?: string;
  joinTimestamp: number;
  participants: Record<string, string>;

  send: (stamp: Stamp) => void;
}>({
  displayName: "Anon",
  joinTimestamp: 0,
  participants: {},
  send(stamp) {
    if (!this.channel) return;

    this.channel.send({
      type: "broadcast",
      event: "stamp",
      payload: { ...stamp, sender: this.displayName },
    });
  },
});

interface Presence {
  name: string;
  joinTimestamp: number;
}

export const initializeRoom = () => {
  onMount(() => {
    const id = new URL(document.URL).searchParams.get("room") ?? undefined;
    if (id === undefined) return;

    room.client = createClient(SUPABASE_URL, SUPABASE_KEY);

    room.displayName =
      localStorage.getItem("stamp-room-display-name") ?? "Anon";

    room.id = id;
    room.presenceId = crypto.randomUUID();
    room.channel = room.client.channel(room.id, {
      config: { presence: { key: room.presenceId } },
    });
    room.joinTimestamp = Date.now();

    room.channel
      .on("broadcast", { event: "stamp" }, async (data) => {
        const stamp: Stamp & { sender: string } = data.payload;
        const loaded = await loadStamp(stamp);
        displayStamp({ ...loaded, sender: stamp.sender });
      })
      .on("presence", { event: "sync" }, () => {
        room.participants = Object.fromEntries(
          Object.entries(room.channel!.presenceState<Presence>()).map(
            ([key, values]) => [key, values.at(-1)!.name],
          ),
        );
      })
      .on<Presence>("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key in room.participants) {
          const { name: newName } = newPresences[0]!;
          if (room.presenceId !== key) {
            const oldName = room.participants[key]!;
            toast.info(`${oldName} changed their display name to ${newName}.`);
          } else {
            toast.info(`Display name updated to ${newName}`);
          }
        } else {
          const { name, joinTimestamp } = newPresences[0]!;
          if (room.presenceId !== key && joinTimestamp > room.joinTimestamp)
            toast.info(`${name} just joined!`);
        }
      })
      .on<Presence>("presence", { event: "leave" }, ({ leftPresences }) => {
        const { name } = leftPresences[0]!;
        toast.info(`${name} just left.`);
      })
      .subscribe();
  });

  $effect(() => {
    if (room.displayName && room.joinTimestamp !== 0 && room.channel) {
      room.channel.track({
        name: room.displayName,
        joinTimestamp: room.joinTimestamp,
      } satisfies Presence);
      localStorage.setItem("stamp-room-display-name", room.displayName);
    }
  });
};
