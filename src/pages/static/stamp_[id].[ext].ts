import type {
	APIRoute,
	GetStaticPaths,
	InferGetStaticParamsType,
	InferGetStaticPropsType,
} from "astro";

import { bestdori } from "~/lib/bestdori";
import { fetchStamps } from "~/lib/fetch-stamp";

export const GET: APIRoute<Props, Params> = async ({
	params,
	props: { stamp },
}) => {
	const id = stamp.id.toString().padStart(6, "0");
	const data = await bestdori(
		params.ext === "mp3"
			? `/assets/${stamp.region}/sound/voice_stamp_rip/stamp_${id}.mp3`
			: `/assets/${stamp.region}/stamp/01_rip/stamp_${id}.png`,
		"buffer",
	);

	return new Response(data);
};

export const getStaticPaths = (async () => {
	const stamps = await fetchStamps();
	const exts = ["mp3", "png"] as const;

	return stamps.flatMap((stamp) =>
		exts
			// skip mp3 on not-voiced stamps
			.filter((ext) => stamp.voiced || ext !== "mp3")
			.map((ext) => ({
				params: { id: stamp.id, ext },
				props: { stamp },
			})),
	);
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
type Params = InferGetStaticParamsType<typeof getStaticPaths>;
