import { z } from "zod";

export const scoreOpportunityInputSchema = z.object({
  title: z.string().min(3),
  askingPrice: z.number().nonnegative(),
  resaleEstimate: z.number().nonnegative(),
  repairEstimate: z.number().nonnegative(),
  locationScore: z.number().min(0).max(10).default(5),
  riskPenalty: z.number().min(0).max(50).default(0),
});

export type ScoreOpportunityInput = z.infer<typeof scoreOpportunityInputSchema>;

export const createOpportunitySchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  platform: z.string().min(2, "La plateforme est requise."),
  location: z.string().min(2, "La localisation est requise."),
  askingPrice: z.coerce.number().nonnegative(),
  repairEstimate: z.coerce.number().nonnegative(),
  resaleEstimate: z.coerce.number().nonnegative(),
  locationScore: z.coerce.number().min(0).max(10).default(5),
  riskPenalty: z.coerce.number().min(0).max(50).default(0),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

export const createInventoryItemSchema = z.object({
  modelId: z.string().uuid(),
  storageGb: z.coerce.number().refine((value) => [64, 128, 256, 512, 1024].includes(value)),
  color: z.string().optional(),
  status: z.enum(["En stock", "En reparation", "Pret a vendre", "Vendu"]),
  purchasePrice: z.coerce.number().nonnegative(),
  repairCost: z.coerce.number().nonnegative(),
  salePrice: z.union([z.coerce.number().nonnegative(), z.null()]).optional(),
  imei: z.string().optional(),
  notes: z.string().optional(),
  purchaseDate: z.string().date(),
  soldAt: z.union([z.string().date(), z.null()]).optional(),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;

export const updateInventoryItemSchema = createInventoryItemSchema;

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
