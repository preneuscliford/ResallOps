import { ScoreOpportunityInput } from "@/lib/schemas";
import { Opportunity } from "@/types/opportunity";

export function estimateOpportunity(input: ScoreOpportunityInput) {
  const estimatedMargin =
    input.resaleEstimate - input.askingPrice - input.repairEstimate;
  const grossScore = Math.round(
    input.locationScore * 4 +
      clamp(estimatedMargin, -50, 150) * 0.4 +
      (input.askingPrice > 0
        ? ((input.resaleEstimate - input.askingPrice) / input.askingPrice) * 25
        : 0) -
      input.riskPenalty,
  );

  return {
    title: input.title,
    estimatedMargin,
    score: clamp(Math.round(grossScore), 0, 100),
    recommendation: getRecommendation(estimatedMargin, grossScore),
  };
}

export function getRecommendation(
  estimatedMargin: number,
  score: number,
): Opportunity["recommendedAction"] {
  if (score >= 80 && estimatedMargin >= 70) {
    return "Contacter";
  }

  if (score >= 60 && estimatedMargin >= 30) {
    return "Negocier";
  }

  return "Ignorer";
}

export function getRiskLevel(
  score: number,
  riskPenalty: number,
): Opportunity["riskLevel"] {
  if (riskPenalty >= 25 || score < 50) {
    return "Eleve";
  }

  if (riskPenalty >= 10 || score < 75) {
    return "Moyen";
  }

  return "Faible";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
