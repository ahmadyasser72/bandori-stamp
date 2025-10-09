import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { fetchBestdori } from "~/bestdori";

export const GET: APIRoute = async ({ params: { stampId, region } }) =>
  fetchBestdori(`/assets/${region}/sound/voice_stamp_rip/${stampId}.mp3`);

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps
    .filter(({ data }) => data.voiced)
    .map(({ data: { stampId, region } }) => ({ params: { region, stampId } }));
};
