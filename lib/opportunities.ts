import { mockOpportunities } from "@/lib/mock-data";
import { fetchEbayListings, isBulkListing } from "@/lib/collectors/ebay";
import {
  estimateRepairProfile,
  estimateResaleFromTitle,
  isEligibleIphoneModel,
} from "@/lib/market-pricing";
import { ACQUISITION_BUDGET_MAX, ACQUISITION_BUDGET_MIN } from "@/lib/budget";
import { CreateOpportunityInput } from "@/lib/schemas";
import { estimateOpportunity, getRiskLevel } from "@/lib/scoring";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { Opportunity, OpportunityInsert, OpportunityRecord, SyncResult } from "@/types/opportunity";

export async function getOpportunities(): Promise<Opportunity[]> {
  if (!hasSupabaseServerEnv()) {
    return mockOpportunities;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id, title, platform, location, asking_price, repair_estimate, resale_estimate, estimated_margin, score, risk_level, recommended_action",
    )
    .gte("asking_price", ACQUISITION_BUDGET_MIN)
    .lte("asking_price", ACQUISITION_BUDGET_MAX)
    .order("score", { ascending: false });

  if (error) {
    console.error("[opportunities] echec de la lecture Supabase", error);
    throw new Error("Impossible de charger les opportunites depuis Supabase.");
  }

  return (data ?? [])
    .map(mapOpportunityRecord)
    .filter((opportunity) => !isBulkListing(opportunity.title))
    .filter((opportunity) => isEligibleIphoneModel(opportunity.title));
}

export async function getOpportunitySummary() {
  const opportunities = await getOpportunities();
  const qualifiedCount = opportunities.length;
  const bestOpportunity = opportunities[0];
  const profitableOpportunities = opportunities.filter(
    (opportunity) => opportunity.score >= 70,
  );

  const averageMargin =
    profitableOpportunities.length > 0
      ? Math.round(
          profitableOpportunities.reduce(
            (sum, opportunity) => sum + opportunity.estimatedMargin,
            0,
          ) / profitableOpportunities.length,
        )
      : 0;

  return [
    {
      label: "Annonces qualifiees",
      value: String(qualifiedCount),
      detail:
        qualifiedCount > 0
          ? "synchronisees depuis votre base Supabase"
          : "aucune opportunite disponible",
    },
    {
      label: "Meilleur score",
      value: bestOpportunity ? `${bestOpportunity.score}/100` : "0/100",
      detail: bestOpportunity?.title ?? "ajoutez votre premiere opportunite",
    },
    {
      label: "Marge moyenne",
      value: `${averageMargin} EUR`,
      detail: "sur les opportunites au-dessus de 70/100",
    },
    {
      label: "Mode source",
      value: opportunities === mockOpportunities ? "Exemple" : "Supabase",
      detail:
        opportunities === mockOpportunities
          ? "donnees locales de secours"
          : "lecture base active",
    },
    {
      label: "Budget cible",
      value: `${ACQUISITION_BUDGET_MIN}-${ACQUISITION_BUDGET_MAX} EUR`,
      detail: "focus phase construction",
    },
    {
      label: "Modeles vises",
      value: "XR et plus",
      detail: "anciens modeles exclus",
    },
  ];
}

export async function createOpportunity(input: CreateOpportunityInput) {
  const supabase = getSupabaseServerClient();
  const estimate = estimateOpportunity({
    title: input.title,
    askingPrice: input.askingPrice,
    repairEstimate: input.repairEstimate,
    resaleEstimate: input.resaleEstimate,
    locationScore: input.locationScore,
    riskPenalty: input.riskPenalty,
  });

  const opportunityToInsert: OpportunityInsert = {
    title: input.title,
    platform: input.platform,
    location: input.location,
    asking_price: input.askingPrice,
    repair_estimate: input.repairEstimate,
    resale_estimate: input.resaleEstimate,
    estimated_margin: estimate.estimatedMargin,
    score: estimate.score,
    risk_level: getRiskLevel(estimate.score, input.riskPenalty),
    recommended_action: estimate.recommendation,
  };

  const { data, error } = await supabase
    .from("opportunities")
    .insert(opportunityToInsert)
    .select(
      "id, title, platform, location, asking_price, repair_estimate, resale_estimate, estimated_margin, score, risk_level, recommended_action",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapOpportunityRecord(data);
}

export async function syncEbayQuery(query: string): Promise<SyncResult> {
  const supabase = getSupabaseServerClient();
  const listings = await fetchEbayListings(query);
  let imported = 0;
  let skipped = 0;

  for (const listing of listings) {
    const { data: existing } = await supabase
      .from("opportunities")
      .select("id")
      .eq("platform", "eBay")
      .eq("title", listing.title)
      .eq("asking_price", listing.askingPrice)
      .maybeSingle();

    if (existing) {
      skipped += 1;
      continue;
    }

    const repairProfile = estimateRepairProfile(`${listing.title} ${listing.subtitle}`);

    await createOpportunity({
      title: listing.title,
      platform: "eBay",
      location: "Import eBay",
      askingPrice: listing.askingPrice,
      repairEstimate: repairProfile.repairEstimate,
      resaleEstimate: estimateResaleFromTitle(listing.title),
      locationScore: 4,
      riskPenalty: repairProfile.riskPenalty,
    });

    imported += 1;
  }

  return {
    imported,
    skipped,
    totalFetched: listings.length,
    query,
  };
}

function mapOpportunityRecord(record: OpportunityRecord): Opportunity {
  return {
    id: record.id,
    title: record.title,
    platform: record.platform,
    location: record.location === "eBay import" ? "Import eBay" : record.location,
    askingPrice: record.asking_price,
    repairEstimate: record.repair_estimate,
    resaleEstimate: record.resale_estimate,
    estimatedMargin: record.estimated_margin,
    score: record.score,
    riskLevel: record.risk_level,
    recommendedAction: record.recommended_action,
  };
}
