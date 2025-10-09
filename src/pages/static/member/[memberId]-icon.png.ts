import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { fetchBestdori } from "~/bestdori";

export const GET: APIRoute = async ({ props: { memberId } }) =>
  fetchBestdori(`/res/icon/chara_icon_${memberId}.png`);

export const getStaticPaths: GetStaticPaths = async () => {
  const members = await getCollection("members");

  return members.map(({ data }) => ({
    params: { memberId: data.id },
    props: { memberId: Number(data.id) },
  }));
};
