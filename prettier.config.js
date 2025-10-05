/** @type {import("prettier").Config} */
export default {
  plugins: [
    "prettier-plugin-astro",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  importOrderSeparation: true,
  importOrder: ["<THIRD_PARTY_MODULES>", "^~/(.*)$", "^[.+/]"],
};
