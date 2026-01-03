import { bestdori } from "./bestdori";

const REGIONS = ["en", "jp"] as const;
type Region = (typeof REGIONS)[number];

const fetchStampByRegion = async (region: Region) => {
	const stampImages = (
		await bestdori<string[]>(`api/explorer/${region}/assets/stamp/01.json`)
	)
		.filter((it) => it.endsWith(".png"))
		.map((it) => it.replace(/\.png$/, ""));
	const stampVoices = (
		await bestdori<string[]>(
			`api/explorer/${region}/assets/sound/voice_stamp.json`,
		)
	)
		.filter((it) => it.endsWith(".mp3"))
		.map((it) => it.replace(/\.mp3$/, ""));

	return stampImages.map((id) => ({
		id: id.split("_")[1].padStart(6, "0"),
		region,
		voiced: stampVoices.includes(id),
	}));
};

export const fetchStamps = async () => {
	const stamps = new Map<
		string,
		Awaited<ReturnType<typeof fetchStampByRegion>>[number]
	>();

	const enStamps = await fetchStampByRegion("en");
	for (const stamp of enStamps) stamps.set(stamp.id, stamp);

	const jpStamps = await fetchStampByRegion("jp");
	for (const stamp of jpStamps) {
		const existing = stamps.get(stamp.id);
		if (!existing || (!existing.voiced && stamp.voiced))
			stamps.set(stamp.id, stamp);
	}

	return [...stamps.values()]
		.sort((a, b) => Number(a.id) - Number(b.id))
		.sort((a, b) => -Number(a.voiced && !b.voiced));
};
