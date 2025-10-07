import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import * as devalue from "devalue";

export { getStaticPaths } from "./index.astro";

export const GET: APIRoute = async ({ params }) => {
  const { region } = params;

  const stamps = (
    await getCollection(
      "stamps",
      ({ data }) => region === undefined || data.region === region,
    )
  ).map(({ data }) => data);

  return new Response(devalue.stringify(stamps));
};
