import { Opportunity, SummaryStat } from "@/types/opportunity";

export const summaryStats: SummaryStat[] = [
  {
    label: "Annonces qualifiees",
    value: "24",
    detail: "sur les 48 dernieres heures",
  },
  {
    label: "Meilleur score",
    value: "88/100",
    detail: "iPhone 13 128 Go, ecran a remplacer",
  },
  {
    label: "Marge moyenne",
    value: "71 EUR",
    detail: "sur les opportunites au-dessus de 70/100",
  },
  {
    label: "Zones actives",
    value: "IDF",
    detail: "Paris, 92, 93, 94 prioritaires",
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp_1",
    title: "iPhone 13 128 Go - ecran casse",
    platform: "Leboncoin",
    location: "Saint-Denis",
    askingPrice: 220,
    repairEstimate: 65,
    resaleEstimate: 385,
    estimatedMargin: 100,
    score: 88,
    riskLevel: "Faible",
    recommendedAction: "Contacter",
  },
  {
    id: "opp_2",
    title: "iPhone 12 mini - batterie fatiguee",
    platform: "eBay",
    location: "Paris 18e",
    askingPrice: 170,
    repairEstimate: 30,
    resaleEstimate: 275,
    estimatedMargin: 75,
    score: 74,
    riskLevel: "Moyen",
    recommendedAction: "Negocier",
  },
  {
    id: "opp_3",
    title: "iPhone 11 - ne s'allume plus",
    platform: "Leboncoin",
    location: "Creteil",
    askingPrice: 145,
    repairEstimate: 90,
    resaleEstimate: 230,
    estimatedMargin: -5,
    score: 38,
    riskLevel: "Eleve",
    recommendedAction: "Ignorer",
  },
];
