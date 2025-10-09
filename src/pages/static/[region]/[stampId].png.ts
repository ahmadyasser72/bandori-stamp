import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { fetchBestdori } from "~/bestdori";

export const GET: APIRoute = async ({ params: { stampId, region } }) =>
  fetchBestdori(`/assets/${region}/stamp/01_rip/${stampId}.png`);

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps.map(({ data: { stampId, region } }) => ({
    params: { region, stampId },
  }));
};
