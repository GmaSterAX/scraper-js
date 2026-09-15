import { discoverCatalogue } from "./catalogue.js";
import { extractAllBooks } from "./detail.js";

async function main() {
  const { uniqueUrls, sourcePageOf } = await discoverCatalogue();
  const records = await extractAllBooks(uniqueUrls, sourcePageOf);

  console.log(JSON.stringify(records[0], null, 2));
}

main().catch((err) => {
  console.error("Run failed:", err.message);
  process.exit(1);
});