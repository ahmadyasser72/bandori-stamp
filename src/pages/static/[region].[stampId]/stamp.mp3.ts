import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { REGIONS } from "~/constants";

export const GET: APIRoute = async ({ params }) => {
  const { region, stampId } = params;

  const audioResponse = await fetch(
    `https://bestdori.com/assets/${region}/sound/voice_stamp_rip/${stampId}.mp3`,
  );

  return new Response(await audioResponse.arrayBuffer());
};

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps
    .filter(({ data }) => data.voiced)
    .flatMap(({ data: { stampId } }) =>
      REGIONS.map((region) => ({ params: { region, stampId } })),
    );
};
