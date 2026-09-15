import fs from "fs/promises";
import path from "path";

const USER_AGENT = "FlyRankAIInternship/1.0 (https://github.com/GmaSterAX)";
const TIMEOUT_MS = 8000;
const CACHE_DIR = path.join(process.cwd(), "cache");

function cacheFilenameFor(url) {
    const clean = url
        .replace(/^https?:\/\//, "")
        .replace(/[^a-zA-Z0-9]/g, "_");
    return path.join(CACHE_DIR, `${clean}.htmkl`);
}

export async function fetchAndCache(url, { cacheName } = {}) {
    await fs.mkdir(CACHE_DIR, { recursive: true});

   const cachePath = cacheName
    ? path.join(CACHE_DIR, cacheName)
    : cacheFilenameFor(url);

    try {
    const cached = await fs.readFile(cachePath, "utf-8");
    console.log(`CACHE HIT  ${url}  (${cached.length} bytes)`);
    return { html: cached, fromCache: true };
  } catch {
    // not cached yet, continue to real fetch
  }

  // 2. Real fetch with timeout, user-agent, status check
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(`Request failed for ${url}: ${err.message}`);
  }
  clearTimeout(timeout);

  if (response.status !== 200) {
    throw new Error(`Non-200 status (${response.status}) for ${url}`);
  }

  const html = await response.text();
  await fs.writeFile(cachePath, html, "utf-8");
  console.log(`FETCH      ${url}  (${html.length} bytes)`);

  return { html, fromCache: false };
}
