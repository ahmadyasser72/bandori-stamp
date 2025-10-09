import { existsSync, readFileSync, writeFileSync } from "node:fs";

export async function fetchBestdori(pathname: string) {
  const cachePath = `./bestdori-cache/${pathname.replaceAll("/", "_")}`;
  if (existsSync(cachePath)) {
    const cachedResponse = readFileSync(cachePath);
    return new Response(cachedResponse);
  }

  const response = await fetch(new URL(pathname, "https://bestdori.com"));
  const buffer = await response.arrayBuffer().then(Buffer.from);
  writeFileSync(cachePath, buffer);

  return new Response(buffer);
}
