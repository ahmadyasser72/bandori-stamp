import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { REGIONS } from "~/constants";

export const GET: APIRoute = async ({ params }) => {
  const { region, stampId } = params;

  const imageResponse = await fetch(
    `https://bestdori.com/assets/${region}/stamp/01_rip/${stampId}.png`,
  );

  return new Response(await imageResponse.arrayBuffer());
};

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps.flatMap(({ data: { stampId } }) =>
    REGIONS.map((region) => ({ params: { region, stampId } })),
  );
};
