import { discoverCatalogue } from "./catalogue.js";

async function main() {
  const bookUrls = await discoverCatalogue();
}

main().catch((err) => {
  console.error("Run failed:", err.message);
  process.exit(1);
});