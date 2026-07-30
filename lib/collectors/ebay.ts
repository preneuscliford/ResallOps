import { ACQUISITION_BUDGET_MAX, ACQUISITION_BUDGET_MIN } from "@/lib/budget";
import { appEnv, hasEbayEnv } from "@/lib/env";
import { isEligibleIphoneModel } from "@/lib/market-pricing";
import { SafeError } from "@/lib/api-error";

export type EbayListing = {
  title: string;
  url: string;
  askingPrice: number;
  subtitle: string;
};

type EbayItemSummary = {
  title?: string;
  itemWebUrl?: string;
  price?: { value?: string };
  condition?: string;
};

type EbaySearchResponse = {
  itemSummaries?: EbayItemSummary[];
};

type EbayTokenResponse = {
  access_token: string;
  expires_in: number;
};

const EBAY_API_BASE =
  appEnv.ebayEnv === "sandbox" ? "https://api.sandbox.ebay.com" : "https://api.ebay.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getEbayAccessToken(): Promise<string> {
  if (!hasEbayEnv()) {
    throw new SafeError(
      "eBay n'est pas configure. Ajoutez EBAY_CLIENT_ID et EBAY_CLIENT_SECRET.",
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const credentials = Buffer.from(
    `${appEnv.ebayClientId}:${appEnv.ebayClientSecret}`,
  ).toString("base64");

  const response = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Authentification eBay refusee (statut ${response.status}).`);
  }

  const payload = (await response.json()) as EbayTokenResponse;

  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in - 60) * 1000,
  };

  return cachedToken.value;
}

export async function fetchEbayListings(query: string, limit = 12): Promise<EbayListing[]> {
  const token = await getEbayAccessToken();

  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(limit * 4, 200)),
    filter: `price:[${ACQUISITION_BUDGET_MIN}..${ACQUISITION_BUDGET_MAX}],priceCurrency:USD,conditionIds:{7000},buyingOptions:{FIXED_PRICE}`,
  });

  const response = await fetch(
    `${EBAY_API_BASE}/buy/browse/v1/item_summary/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Accept-Language": "en-US",
      },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(`eBay a repondu avec le statut ${response.status}.`);
  }

  const payload = (await response.json()) as EbaySearchResponse;
  const seenUrls = new Set<string>();
  const listings: EbayListing[] = [];

  for (const item of payload.itemSummaries ?? []) {
    if (listings.length >= limit) {
      break;
    }

    const title = item.title?.trim();
    const url = item.itemWebUrl;
    const askingPrice = item.price?.value ? Math.round(Number.parseFloat(item.price.value)) : 0;
    const subtitle = item.condition ?? "";

    if (!title || !url || !askingPrice || seenUrls.has(url)) {
      continue;
    }

    if (!/iphone/i.test(title)) {
      continue;
    }

    if (!isEligibleIphoneModel(title)) {
      continue;
    }

    if (isBulkListing(title)) {
      continue;
    }

    seenUrls.add(url);
    listings.push({ title, url, askingPrice, subtitle });
  }

  return listings;
}

export function isBulkListing(title: string) {
  return /\blot\b|\blot\s+of\b|\bbundle\b|\bpack\b|\bof\s+\d+\b|\b\d+\s*pcs\b|\bset\s+of\b/i.test(
    title,
  );
}
