export type Opportunity = {
  id: string;
  title: string;
  platform: string;
  location: string;
  askingPrice: number;
  repairEstimate: number;
  resaleEstimate: number;
  estimatedMargin: number;
  score: number;
  riskLevel: "Faible" | "Moyen" | "Eleve";
  recommendedAction: "Contacter" | "Negocier" | "Ignorer";
};

export type SummaryStat = {
  label: string;
  value: string;
  detail: string;
};

export type OpportunityRecord = {
  id: string;
  title: string;
  platform: string;
  location: string;
  asking_price: number;
  repair_estimate: number;
  resale_estimate: number;
  estimated_margin: number;
  score: number;
  risk_level: Opportunity["riskLevel"];
  recommended_action: Opportunity["recommendedAction"];
};

export type OpportunityInsert = Omit<OpportunityRecord, "id">;

export type EbaySearchResult = {
  title: string;
  url: string;
  askingPrice: number;
  repairEstimate: number;
  resaleEstimate: number;
  estimatedMargin: number;
  score: number;
  riskLevel: Opportunity["riskLevel"];
  recommendedAction: Opportunity["recommendedAction"];
  modelSlug: string | null;
};

export type SyncResult = {
  query: string;
  totalFetched: number;
  results: EbaySearchResult[];
};
