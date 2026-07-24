import * as cheerio from "cheerio";
import { ACQUISITION_BUDGET_MAX, ACQUISITION_BUDGET_MIN } from "@/lib/budget";
import { isEligibleIphoneModel } from "@/lib/market-pricing";

export type EbayListing = {
  title: string;
  url: string;
  askingPrice: number;
  subtitle: string;
};

export async function fetchEbayListings(query: string, limit = 12) {
  const url = buildEbaySearchUrl(query);
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`eBay a repondu avec le statut ${response.status}.`);
  }

  const html = await response.text();
  return parseEbaySearchResults(html, limit);
}

export function parseEbaySearchResults(html: string, limit = 12): EbayListing[] {
  const $ = cheerio.load(html);
  const seenUrls = new Set<string>();
  const listings: EbayListing[] = [];

  $("li.s-card").each((_, element) => {
    if (listings.length >= limit) {
      return false;
    }

    const card = $(element);
    const rawTitle = card.find(".s-card__title").first().text().trim();
    const rawPrice = card.find(".s-card__price").first().text().trim();
    const url = card.find(".s-card__link").first().attr("href")?.trim();
    const subtitle = card.find(".s-card__subtitle").first().text().trim();

    const title = cleanTitle(rawTitle);
    const askingPrice = extractPrice(rawPrice);

    if (!title || !url || !askingPrice) {
      return;
    }

    if (title === "Shop on eBay" || seenUrls.has(url)) {
      return;
    }

    if (!/iphone/i.test(title)) {
      return;
    }

    if (!isEligibleIphoneModel(title)) {
      return;
    }

    if (askingPrice < ACQUISITION_BUDGET_MIN || askingPrice > ACQUISITION_BUDGET_MAX) {
      return;
    }

    if (isBulkListing(title)) {
      return;
    }

    seenUrls.add(url);
    listings.push({
      title,
      url,
      askingPrice,
      subtitle,
    });
  });

  return listings;
}

function buildEbaySearchUrl(query: string) {
  const params = new URLSearchParams({
    _nkw: query,
    LH_BIN: "1",
    _sop: "10",
    LH_ItemCondition: "7000",
  });

  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

function cleanTitle(title: string) {
  return title
    .replace(/^New Listing/i, "")
    .replace(/Opens in a new window or tab/gi, "")
    .replace(/\(\d+\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPrice(priceLabel: string) {
  const match = priceLabel.match(/([\d,]+(?:\.\d{2})?)/);

  if (!match) {
    return 0;
  }

  return Math.round(Number.parseFloat(match[1].replace(/,/g, "")));
}

export function isBulkListing(title: string) {
  return /\blot\b|\blot\s+of\b|\bbundle\b|\bpack\b|\bof\s+\d+\b|\b\d+\s*pcs\b|\bset\s+of\b/i.test(
    title,
  );
}
