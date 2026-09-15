import * as cheerio from "cheerio";
import { fetchAndCache } from "./fetcher.js";

const BASE = "https://books.toscrape.com/";
const DELAY_MS = 600;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCataloguePage(html, pageUrl) {
  const $ = cheerio.load(html);

  const bookUrls = $("article.product_pod h3 a")
    .map((_, el) => new URL($(el).attr("href"), pageUrl).toString())
    .get();

  const nextHref = $("li.next a").attr("href");
  const nextUrl = nextHref ? new URL(nextHref, pageUrl).toString() : null;

  return { bookUrls, nextUrl };
}

export async function discoverCatalogue() {
  const allBookUrls = [];
  let pageUrl = BASE;
  let pageCount = 0;

  while (pageUrl && pageCount < 3) {
    pageCount++;
    const cacheName = `catalogue-page-${pageCount}.html`;

    const { html, fromCache } = await fetchAndCache(pageUrl, { cacheName });
    if (!fromCache) await delay(DELAY_MS);

    const { bookUrls, nextUrl } = parseCataloguePage(html, pageUrl);
    allBookUrls.push(...bookUrls);
    pageUrl = nextUrl;
  }

  const uniqueUrls = [...new Set(allBookUrls)];
  console.log(
    `catalogue_pages=${pageCount} discovered=${allBookUrls.length} unique_urls=${uniqueUrls.length}`
  );

  return uniqueUrls;
}
