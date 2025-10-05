export const REGIONS = ["en", "jp"] as const;

export const REGION_FLAG = {
  en: "twemoji:flag-united-states",
  jp: "twemoji:flag-japan",
} satisfies Record<(typeof REGIONS)[number], string>;

export const REGION_FULLNAME = {
  en: "English",
  jp: "Japanese",
} satisfies Record<(typeof REGIONS)[number], string>;
