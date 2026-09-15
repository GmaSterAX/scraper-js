import { discoverCatalogue } from "./catalogue.js";
import { extractAllBooks } from "./detail.js";
import { validateAndStore } from "./validate.js";

async function main() {
  const { uniqueUrls, sourcePageOf } = await discoverCatalogue();
  const rawRecords = await extractAllBooks(uniqueUrls, sourcePageOf);
  await validateAndStore(rawRecords);
}

main().catch((err) => {
  console.error("Run failed:", err.message);
  process.exit(1);
});