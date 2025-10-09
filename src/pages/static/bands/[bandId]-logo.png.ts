import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { fetchBestdori } from "~/bestdori";

export const GET: APIRoute = async ({ params: { bandId } }) =>
  fetchBestdori(`/assets/jp/band/logo/${bandId}_rip/logoL.png`);

export const getStaticPaths: GetStaticPaths = async () => {
  const bands = await getCollection("bands");

  return bands.map(({ data }) => ({
    params: { bandId: data.id },
  }));
};
