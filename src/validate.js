import fs from "fs/promises";
import path from "path";
import { BookSchema } from "./schema.js";
import { normalizeRecord } from "./normalize.js";

const OUTPUT_DIR = path.join(process.cwd(), "output");

export async function validateAndStore(rawRecords) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Deduplicate by product_url (canonical URL) — keep the first occurrence
  const seen = new Set();
  const deduped = [];
  for (const raw of rawRecords) {
    if (!seen.has(raw.product_url)) {
      seen.add(raw.product_url);
      deduped.push(raw);
    }
  }

  const validRecords = [];
  const errors = [];

  for (const raw of deduped) {
    const normalized = normalizeRecord(raw);
    const result = BookSchema.safeParse(normalized);

    if (result.success) {
      validRecords.push(result.data);
    } else {
      errors.push({
        product_url: raw.product_url,
        reason: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "books.json"),
    JSON.stringify(validRecords, null, 2),
    "utf-8"
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, "errors.json"),
    JSON.stringify(errors, null, 2),
    "utf-8"
  );

  console.log(`valid_records=${validRecords.length} invalid_records=${errors.length}`);

  return { validRecords, errors };
}