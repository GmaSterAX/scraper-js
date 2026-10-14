import fs from "fs/promises";
import path from "path";

const USER_AGENT = "FlyRankInternshipA9/1.0 (+https://github.com/GmaSterAX/scraper-js)";
const TIMEOUT_MS = 8000;
const RETRY_WAIT_MS = 1500;
const CACHE_DIR = path.join(process.cwd(), "cache");

// Counters used by the run report
export const stats = { pagesFetched: 0, cacheHits: 0 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheFilenameFor(url) {
  const clean = url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_");
  return path.join(CACHE_DIR, `${clean}.html`);
}

// One real request. Marks the error as retryable or not.
async function fetchOnce(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } catch (err) {
    const error = new Error(`Request failed for ${url}: ${err.message}`);
    error.retryable = true;
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status !== 200) {
    const error = new Error(`Non-200 status (${response.status}) for ${url}`);
    error.retryable = response.status >= 500;
    throw error;
  }

  return response.text();
}

export async function fetchAndCache(url, { cacheName } = {}) {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const cachePath = cacheName
    ? path.join(CACHE_DIR, cacheName)
    : cacheFilenameFor(url);

  // 1. Cache first
  try {
    const cached = await fs.readFile(cachePath, "utf-8");
    console.log(`CACHE HIT  ${url}  (${cached.length} bytes)`);
    stats.cacheHits++;
    return { html: cached, fromCache: true };
  } catch {
    // not cached yet
  }

  
  let html;
  try {
    html = await fetchOnce(url);
  } catch (err) {
    if (!err.retryable) throw err;
    console.log(`RETRY      ${url}  (${err.message})`);
    await wait(RETRY_WAIT_MS);
    html = await fetchOnce(url);
  }

  await fs.writeFile(cachePath, html, "utf-8");
  console.log(`FETCH      ${url}  (${html.length} bytes)`);
  stats.pagesFetched++;

  return { html, fromCache: false };
}