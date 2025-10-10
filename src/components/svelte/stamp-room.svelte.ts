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
import { isTabActive, loadStamp } from "./utilities";

export const room = $state<{
  client?: SupabaseClient;
  channel?: RealtimeChannel;

  id?: string;
  displayName: string;
  presenceId?: string;
  joinTimestamp: number;
  participants: Record<string, string>;

  send: (stamp: Stamp) => void;
  updatePresence: (active: boolean) => void;
}>({
  displayName: "Anon",
  joinTimestamp: 0,
  participants: {},
  send(stamp) {
    if (!this.channel || !this.presenceId) return;

    this.channel.send({
      type: "broadcast",
      event: "stamp",
      payload: { ...stamp, sender: this.presenceId },
    });
  },
  updatePresence(active) {
    if (!this.displayName || this.joinTimestamp === 0 || !this.channel) return;

    const presence = {
      name: this.displayName,
      joinTimestamp: this.joinTimestamp,
    } satisfies Presence;

    if (active) {
      this.channel.track(presence);
    } else {
      this.channel.untrack(presence);
    }
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
        if (!isTabActive()) return;

        const stamp: Stamp & { sender: string } = data.payload;
        const loaded = await loadStamp(stamp);
        displayStamp({ ...loaded, sender: room.participants[stamp.sender]! });
      })
      .on("presence", { event: "sync" }, () => {
        room.participants = Object.fromEntries(
          Object.entries(room.channel!.presenceState<Presence>()).map(
            ([key, values]) => [key, values.at(-1)!.name],
          ),
        );
      })
      .on<Presence>("presence", { event: "join" }, ({ key, newPresences }) => {
        if (!isTabActive()) return;

        // if they already here...
        if (key in room.participants) {
          const oldName = room.participants[key]!;
          const { name: newName } = newPresences[0]!;

          // if name is not modified
          if (oldName === newName) return;

          // if they are not ourselves...
          if (room.presenceId !== key) {
            toast.info(`${oldName} changed their display name to ${newName}.`);
          } else {
            toast.info(`Display name updated to ${newName}.`);
          }
        } else {
          const { name, joinTimestamp } = newPresences[0]!;
          // if they are not ourselves AND if they join later than we do
          if (room.presenceId !== key && joinTimestamp > room.joinTimestamp)
            toast.info(`${name} just joined!`);
        }
      })
      .on<Presence>(
        "presence",
        { event: "leave" },
        ({ key, currentPresences, leftPresences }) => {
          // if they are ourselves OR they're still here, early exit
          if (
            !isTabActive() ||
            room.presenceId === key ||
            currentPresences.length !== 0
          )
            return;

          const { name } = leftPresences[0]!;
          toast.info(`${name} just left.`);
        },
      )
      .subscribe();

    let inactiveTimer: ReturnType<typeof setTimeout>;
    const handleInactiveTab = () => {
      if (isTabActive()) {
        clearTimeout(inactiveTimer);
        room.updatePresence(true);
      } else {
        // send leave presence event after 20s
        inactiveTimer = setTimeout(() => room.updatePresence(false), 20_000);
      }
    };
    document.addEventListener("visibilitychange", handleInactiveTab);

    return () => {
      room.client!.removeChannel(room.channel!);
      document.removeEventListener("visibilitychange", handleInactiveTab);
    };
  });

  $effect(() => {
    room.displayName;
    room.updatePresence(true);
    localStorage.setItem("stamp-room-display-name", room.displayName);
  });
};
