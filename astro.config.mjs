// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://ahmadyasser72.github.io",
  base: "/bandori-stamp",

  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "client", access: "public" }),
      SUPABASE_KEY: envField.string({ context: "client", access: "public" }),
    },
  },

  devToolbar: { enabled: false },
  trailingSlash: "ignore",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte()],
});
