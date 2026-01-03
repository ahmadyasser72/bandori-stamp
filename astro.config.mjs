// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	adapter: cloudflare(),

	build: { concurrency: 4 },
	vite: {
		plugins: [tailwindcss()],
		ssr: { external: ["node:fs", "node:path"] },
	},
	devToolbar: { enabled: false },
});
