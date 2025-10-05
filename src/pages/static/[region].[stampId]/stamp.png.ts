import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { existsSync, writeFileSync, readFileSync } from "node:fs";

export const GET: APIRoute = async ({ params, props }) => {
  const { id } = props;
  const { region, stampId } = params;

  const cachePath = `./bestdori-cache/${id}.png`;
  if (existsSync(cachePath)) {
    const cachedResponse = readFileSync(cachePath);
    return new Response(cachedResponse);
  }

  const imageResponse = await fetch(
    `https://bestdori.com/assets/${region}/stamp/01_rip/${stampId}.png`,
  );
  writeFileSync(
    cachePath,
    await imageResponse.clone().arrayBuffer().then(Buffer.from),
  );

  return new Response(await imageResponse.arrayBuffer());
};

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps.map(({ data: { id, stampId, region } }) => ({
    params: { region, stampId },
    props: { id },
  }));
};
