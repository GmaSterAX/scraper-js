import fs from "fs/promises";
import path from "path";
import { discoverCatalogue } from "./catalogue.js";
import { extractAllBooks } from "./detail.js";
import { validateAndStore } from "./validate.js";
import { stats } from "./fetcher.js";

async function main() {
  const startedAt = new Date();

  const { uniqueUrls, sourcePageOf } = await discoverCatalogue();

  //node src/index.js --with-fake
  if (process.argv.includes("--with-fake")) {
    uniqueUrls.push("https://books.toscrape.com/catalogue/this-book-does-not-exist_999/index.html");
  }

  const { records, failedPages } = await extractAllBooks(uniqueUrls, sourcePageOf);
  const { validRecords, errors } = await validateAndStore(records);

  const report = {
    start_time: startedAt.toISOString(),
    duration_seconds: Number(((Date.now() - startedAt.getTime()) / 1000).toFixed(1)),
    pages_fetched: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: validRecords.length,
    invalid_records: errors.length,
    failed_pages: failedPages.length,
  };

  await fs.writeFile(
    path.join(process.cwd(), "output", "run-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("run-report:", report);
}

main().catch((err) => {
  console.error("Run failed:", err.message);
  process.exit(1);
});