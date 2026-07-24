const MODEL_BASELINES: Array<{ pattern: RegExp; resaleEstimate: number }> = [
  { pattern: /iphone\s+15\s+pro\s+max/i, resaleEstimate: 820 },
  { pattern: /iphone\s+15\s+pro/i, resaleEstimate: 720 },
  { pattern: /iphone\s+15\s+plus/i, resaleEstimate: 680 },
  { pattern: /iphone\s+15/i, resaleEstimate: 610 },
  { pattern: /iphone\s+14\s+pro\s+max/i, resaleEstimate: 690 },
  { pattern: /iphone\s+14\s+pro/i, resaleEstimate: 590 },
  { pattern: /iphone\s+14\s+plus/i, resaleEstimate: 520 },
  { pattern: /iphone\s+14/i, resaleEstimate: 470 },
  { pattern: /iphone\s+13\s+pro\s+max/i, resaleEstimate: 560 },
  { pattern: /iphone\s+13\s+pro/i, resaleEstimate: 470 },
  { pattern: /iphone\s+13\s+mini/i, resaleEstimate: 320 },
  { pattern: /iphone\s+13/i, resaleEstimate: 390 },
  { pattern: /iphone\s+12\s+pro\s+max/i, resaleEstimate: 440 },
  { pattern: /iphone\s+12\s+pro/i, resaleEstimate: 390 },
  { pattern: /iphone\s+12\s+mini/i, resaleEstimate: 275 },
  { pattern: /iphone\s+12/i, resaleEstimate: 320 },
  { pattern: /iphone\s+xs\s+max/i, resaleEstimate: 240 },
  { pattern: /iphone\s+xs/i, resaleEstimate: 220 },
  { pattern: /iphone\s+xr/i, resaleEstimate: 210 },
  { pattern: /iphone\s+11\s+pro\s+max/i, resaleEstimate: 350 },
  { pattern: /iphone\s+11\s+pro/i, resaleEstimate: 310 },
  { pattern: /iphone\s+11/i, resaleEstimate: 240 },
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
