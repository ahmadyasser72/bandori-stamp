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

export interface Participant {
  id: string;
  displayName: string;
  badgeColor: string | undefined; // #000000
  joined: number; // Date.now()
}

export interface RoomState {
  id?: string | undefined;
  client?: SupabaseClient;
  channel?: RealtimeChannel;

  self: Participant;
  participants: Record<string, Participant>;

  send: (stamp: Stamp) => void;
  updatePresence: (active: boolean) => void;
}

const LOCAL_STORAGE_STATE_KEY = "stamp-room-self-state";
export const room = $state<RoomState>({
  participants: {},
  self: {
    id: crypto.randomUUID(),
    displayName: "Anon",
    badgeColor: undefined,
    joined: 0,
  },

  send(stamp) {
    if (!this.channel) return;

    this.channel.send({
      type: "broadcast",
      event: "stamp",
      payload: { ...stamp, sender: this.self.id },
    });
  },
  updatePresence(active) {
    if (this.self.joined === 0 || !this.channel) return;

    if (active) this.channel.track(this.self);
    else this.channel.untrack(this.self);
  },
});

export const initializeRoom = () => {
  onMount(() => {
    room.id = new URL(document.URL).searchParams.get("room") ?? undefined;
    if (room.id === undefined) return;

    room.client = createClient(SUPABASE_URL, SUPABASE_KEY);

    room.self = {
      ...room.self,
      ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_STATE_KEY) ?? "{}"),
      joined: Date.now(),
    };

    room.channel = room.client.channel(room.id, {
      config: { presence: { key: room.self.id } },
    });

    room.channel
      .on("broadcast", { event: "stamp" }, async (data) => {
        if (!isTabActive()) return;

        const stamp: Stamp & { sender: string } = data.payload;
        const loaded = await loadStamp(stamp);
        displayStamp({
          ...loaded,
          sender: room.participants[stamp.sender]!,
        });
      })
      .on("presence", { event: "sync" }, () => {
        room.participants = Object.fromEntries(
          Object.entries(room.channel!.presenceState<Participant>()).map(
            ([key, values]) => [key, values.at(-1)!],
          ),
        );
      })
      .on<Participant>(
        "presence",
        { event: "join" },
        ({ key, newPresences }) => {
          if (!isTabActive()) return;

          // if they already here...
          if (key in room.participants) {
            const oldName = room.participants[key]!.displayName;
            const newName = newPresences[0]!.displayName;

            // if name is not modified
            if (oldName === newName) return;

            // if they are not ourselves...
            if (room.self.id !== key) {
              toast.info(
                `${oldName} changed their display name to ${newName}.`,
              );
            } else {
              toast.info(`Display name updated to ${newName}.`);
            }
          } else {
            const { displayName, joined } = newPresences[0]!;
            // if they are not ourselves AND if they join later than we do
            if (room.self.id !== key && joined > room.self.joined)
              toast.info(`${displayName} just joined!`);
          }
        },
      )
      .on<Participant>(
        "presence",
        { event: "leave" },
        ({ key, currentPresences, leftPresences }) => {
          if (
            !isTabActive() ||
            // if they are ourselves OR they're still here, early exit
            room.self.id === key ||
            currentPresences.length !== 0
          )
            return;

          const { displayName } = leftPresences[0]!;
          toast.info(`${displayName} just left.`);
        },
      )
      .subscribe();

    let inactiveTimer: ReturnType<typeof setTimeout>;
    const handleInactiveTab = () => {
      if (isTabActive()) {
        clearTimeout(inactiveTimer);
        room.updatePresence(true);
      } else {
        // send leave presence event after 15s
        inactiveTimer = setTimeout(() => room.updatePresence(false), 15_000);
      }
    };
    document.addEventListener("visibilitychange", handleInactiveTab);

    return () => {
      room.client!.removeChannel(room.channel!);
      document.removeEventListener("visibilitychange", handleInactiveTab);
    };
  });

  $effect(() => {
    room.self;
    room.updatePresence(true);
    localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(room.self));
  });
};
