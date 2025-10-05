import type { APIRoute } from "astro";

export { getStaticPaths } from "./stamp.png";

export const GET: APIRoute = async ({ params }) => {
  const { region, stampId } = params;

  const audioResponse = await fetch(
    `https://bestdori.com/assets/${region}/sound/voice_stamp_rip/${stampId}.mp3`,
  );

  return new Response(await audioResponse.arrayBuffer());
};
