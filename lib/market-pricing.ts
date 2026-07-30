const MODEL_BASELINES: Array<{ pattern: RegExp; resaleEstimate: number; slug: string }> = [
  { pattern: /iphone\s+15\s+pro\s+max/i, resaleEstimate: 820, slug: "iphone-15-pro-max" },
  { pattern: /iphone\s+15\s+pro/i, resaleEstimate: 720, slug: "iphone-15-pro" },
  { pattern: /iphone\s+15\s+plus/i, resaleEstimate: 680, slug: "iphone-15-plus" },
  { pattern: /iphone\s+15/i, resaleEstimate: 610, slug: "iphone-15" },
  { pattern: /iphone\s+14\s+pro\s+max/i, resaleEstimate: 690, slug: "iphone-14-pro-max" },
  { pattern: /iphone\s+14\s+pro/i, resaleEstimate: 590, slug: "iphone-14-pro" },
  { pattern: /iphone\s+14\s+plus/i, resaleEstimate: 520, slug: "iphone-14-plus" },
  { pattern: /iphone\s+14/i, resaleEstimate: 470, slug: "iphone-14" },
  { pattern: /iphone\s+13\s+pro\s+max/i, resaleEstimate: 560, slug: "iphone-13-pro-max" },
  { pattern: /iphone\s+13\s+pro/i, resaleEstimate: 470, slug: "iphone-13-pro" },
  { pattern: /iphone\s+13\s+mini/i, resaleEstimate: 320, slug: "iphone-13-mini" },
  { pattern: /iphone\s+13/i, resaleEstimate: 390, slug: "iphone-13" },
  { pattern: /iphone\s+12\s+pro\s+max/i, resaleEstimate: 440, slug: "iphone-12-pro-max" },
  { pattern: /iphone\s+12\s+pro/i, resaleEstimate: 390, slug: "iphone-12-pro" },
  { pattern: /iphone\s+12\s+mini/i, resaleEstimate: 275, slug: "iphone-12-mini" },
  { pattern: /iphone\s+12/i, resaleEstimate: 320, slug: "iphone-12" },
  { pattern: /iphone\s+xs\s+max/i, resaleEstimate: 240, slug: "iphone-xs-max" },
  { pattern: /iphone\s+xs/i, resaleEstimate: 220, slug: "iphone-xs" },
  { pattern: /iphone\s+xr/i, resaleEstimate: 210, slug: "iphone-xr" },
  { pattern: /iphone\s+11\s+pro\s+max/i, resaleEstimate: 350, slug: "iphone-11-pro-max" },
  { pattern: /iphone\s+11\s+pro/i, resaleEstimate: 310, slug: "iphone-11-pro" },
  { pattern: /iphone\s+11/i, resaleEstimate: 240, slug: "iphone-11" },
];

const REPAIR_KEYWORDS: Array<{ pattern: RegExp; repairCost: number; riskPenalty: number }> = [
  { pattern: /back glass|vitre arriere/i, repairCost: 45, riskPenalty: 10 },
  { pattern: /screen|ecran|display|lcd|oled/i, repairCost: 70, riskPenalty: 12 },
  { pattern: /battery|batterie/i, repairCost: 30, riskPenalty: 4 },
  { pattern: /camera|camera/i, repairCost: 40, riskPenalty: 8 },
  { pattern: /face id/i, repairCost: 90, riskPenalty: 24 },
  { pattern: /not working|ne s'allume plus|dead|no power/i, repairCost: 110, riskPenalty: 28 },
  { pattern: /icloud|locked|bloqu/i, repairCost: 0, riskPenalty: 35 },
  { pattern: /parts only|for parts|sold as is|damaged/i, repairCost: 35, riskPenalty: 18 },
];

export function estimateResaleFromTitle(title: string) {
  return MODEL_BASELINES.find((item) => item.pattern.test(title))?.resaleEstimate ?? 260;
}

export function guessModelSlugFromTitle(title: string): string | null {
  return MODEL_BASELINES.find((item) => item.pattern.test(title))?.slug ?? null;
}

export function isEligibleIphoneModel(title: string) {
  return (
    /iphone\s+xr/i.test(title) ||
    /iphone\s+xs(\s+max)?/i.test(title) ||
    /iphone\s+1[1-9]\b/i.test(title) ||
    /iphone\s+2\d\b/i.test(title)
  );
}

export function estimateRepairProfile(title: string) {
  let repairEstimate = 25;
  let riskPenalty = 8;

  for (const keyword of REPAIR_KEYWORDS) {
    if (keyword.pattern.test(title)) {
      repairEstimate += keyword.repairCost;
      riskPenalty = Math.max(riskPenalty, keyword.riskPenalty);
    }
  }

  return {
    repairEstimate,
    riskPenalty,
  };
}
