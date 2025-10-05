import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export const GET: APIRoute = async ({ params, props }) => {
  const { id } = props;
  const { region, stampId } = params;

  const cachePath = `./bestdori-cache/${id}.mp3`;
  if (existsSync(cachePath)) {
    const cachedResponse = readFileSync(cachePath);
    return new Response(cachedResponse);
  }

  const audioResponse = await fetch(
    `https://bestdori.com/assets/${region}/sound/voice_stamp_rip/${stampId}.mp3`,
  );
  writeFileSync(
    cachePath,
    await audioResponse.clone().arrayBuffer().then(Buffer.from),
  );

  return new Response(await audioResponse.arrayBuffer());
};

export const getStaticPaths: GetStaticPaths = async () => {
  const stamps = await getCollection("stamps");

  return stamps
    .filter(({ data }) => data.voiced)
    .map(({ data: { id, stampId, region } }) => ({
      params: { region, stampId },
      props: { id },
    }));
};
