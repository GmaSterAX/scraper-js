import * as cheerio from "cheerio";
import { fetchAndCache } from "./fetcher.js";

const DELAY_MS = 600;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


// Turns a product_url into a safe, short cache filename
function cacheNameFor(productUrl) {
  const match = productUrl.match(/catalogue\/(.+)\/index\.html$/);
  const slug = match ? match[1] : productUrl.replace(/[^a-zA-Z0-9]/g, "_");
  return `book-${slug}.html`;
}

function parseBookPage(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);
  const product = $("div.product_main"); // the product area, not the whole page

  const title = product.find("h1").text().trim();
  const price_text = product.find("p.price_color").first().text().trim();
  const availability_text = product
    .find("p.instock.availability")
    .text()
    .replace(/\s+/g, " ")
    .trim();

 const ratingClass = product.find("p.star-rating").attr("class") || "";
 const rating_text = ratingClass.replace("star-rating", "").trim() || null;

  // Description: some books don't have one
 const descriptionEl = $("#product_description").next("p");
 const description = descriptionEl.length ? descriptionEl.text().trim() : null;

 return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

export async function extractAllBooks(bookUrls, sourcePageOf) {
  const records = [];

  for (const url of bookUrls) {
    const cacheName = cacheNameFor(url);
    const { html, fromCache } = await fetchAndCache(url, { cacheName });
    if (!fromCache) await delay(DELAY_MS);

    const sourcePage = sourcePageOf?.get(url) ?? null;
    const record = parseBookPage(html, url, sourcePage);
    records.push(record);
  }

  console.log(`detail_pages=${records.length}`);
  return records;
}