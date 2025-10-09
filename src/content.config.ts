import { file } from "astro/loaders";
import {
  defineCollection,
  reference,
  z,
  type InferEntrySchema,
} from "astro:content";

import { REGIONS } from "~/constants";

export interface Stamp {
  id: string;
  stampId: string;
  voiced: boolean;
  region: (typeof REGIONS)[number];
}
export type Band = InferEntrySchema<"bands">;
export type Member = Omit<InferEntrySchema<"members">, "band"> & {
  band: Band;
};

const stamps = defineCollection({
  loader: (): Promise<Stamp[]> =>
    Promise.all(
      REGIONS.map(async (region) => {
        const allStamps = await fetch(
          `https://bestdori.com/api/explorer/${region}/assets/stamp/01.json`,
        )
          .then((response) => response.json())
          .then((items: string[]) => items.filter((it) => it.endsWith(".png")));

        const allVoicedStamps = await fetch(
          `https://bestdori.com/api/explorer/${region}/assets/sound/voice_stamp.json`,
        )
          .then((response) => response.json())
          .then((items: string[]) => items.filter((it) => it.endsWith(".mp3")));

        return allStamps.map((stamp) => {
          const stampId = stamp.split(".")[0]!;
          const id = `${region}.${stampId}`;

          return {
            id,
            stampId,
            region,
            voiced:
              allVoicedStamps.findIndex(
                (it) => it.split(".")[0] === stampId,
              ) !== -1,
          };
        });
      }),
    ).then((it) => it.flat()),
  schema: z.object({
    id: z.string(),
    stampId: z.string(),
    voiced: z.boolean(),
    region: z.enum(REGIONS),
  }),
});

const bands = defineCollection({
  loader: file("src/data/bands.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
const members = defineCollection({
  loader: file("src/data/members.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    band: reference("bands"),
  }),
});

export const collections = { stamps, bands, members };
