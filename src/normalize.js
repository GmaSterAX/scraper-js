// Turns "£51.77" into 51.77
export function parsePriceGbp(priceText) {
  const match = priceText.replace(/[^0-9.]/g, "");
  const value = parseFloat(match);
  return Number.isFinite(value) ? value : null;
}

export function normalizeRecord(raw) {
  return {
    ...raw,
    price_gbp: parsePriceGbp(raw.price_text),
  };
}