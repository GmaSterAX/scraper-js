# Scraper — FlyRank W5 A9

## Target classification
- **Site:** https://books.toscrape.com
- **Why:** It's a public sandbox explicitly built for practicing web scraping (confirmed at toscrape.com).
- **Scope:** Only the first 3 catalogue pages, and the ~60 book detail pages linked from them.
- **Data collected:** Title, price, availability, rating, description, and URL — publicly displayed book metadata.
- **robots.txt result:** The site says 404 not found.
- **Why this is appropriate:** The site exists for this exact purpose, we're not bypassing any login or paywall, and we're only fetching a small, fixed slice of pages.

I will not reuse this code on another site without checking its rules and terms first.