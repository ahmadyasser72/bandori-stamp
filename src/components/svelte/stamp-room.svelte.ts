import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/client";
import { onMount } from "svelte";

import type { Stamp } from "~/content.config";

import { displayStamp } from "./state-playground.svelte";
import { loadStamp } from "./utilities";

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

export const joinRoom = () => {
  const roomState = $state<{
    id: string | undefined;
    channel: RealtimeChannel | undefined;
  }>({ id: undefined, channel: undefined });
  onMount(() => {
    roomState.id = new URL(document.URL).searchParams.get("room") ?? undefined;
    if (!roomState.id) return;

    roomState.channel = client.channel(roomState.id);
    roomState.channel
      .on("broadcast", { event: "stamp" }, (stamp) =>
        loadStamp(stamp.payload).then(displayStamp),
      )
      .subscribe();

    return () => roomState.channel!.unsubscribe();
  });

  const send = (stamp: Stamp) => {
    if (!roomState.channel) return;

    roomState.channel.send({
      type: "broadcast",
      event: "stamp",
      payload: stamp,
    });
  };

  return { state: roomState, send };
};
