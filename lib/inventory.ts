import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import {
  InventoryItem,
  InventoryItemRecord,
  InventorySummaryStat,
  IphoneModel,
  IphoneModelRecord,
} from "@/types/inventory";

const inventorySelect =
  "id, model_id, storage_gb, color, status, purchase_price, repair_cost, sale_price, sale_margin, imei, notes, purchase_date, sold_at, iphone_models(display_name)";

export async function getIphoneModels(): Promise<IphoneModel[]> {
  if (!hasSupabaseServerEnv()) {
    return fallbackIphoneModels;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("iphone_models")
    .select("id, slug, display_name, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[inventory] echec de la lecture des modeles Supabase", error);
    throw new Error("Impossible de charger les modeles iPhone depuis Supabase.");
  }

  return (data ?? []).map((record: IphoneModelRecord) => ({
    id: record.id,
    slug: record.slug,
    displayName: record.display_name,
    sortOrder: record.sort_order,
  }));
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  if (!hasSupabaseServerEnv()) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select(inventorySelect)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[inventory] echec de la lecture du stock Supabase", error);
    throw new Error("Impossible de charger le stock depuis Supabase.");
  }

  return (data ?? []).map((record) => mapInventoryItemRecord(record as InventoryItemRecord));
}

export async function createInventoryItem(input: {
  modelId: string;
  storageGb: number;
  color?: string;
  status: InventoryItem["status"];
  purchasePrice: number;
  repairCost: number;
  salePrice?: number | null;
  imei?: string;
  notes?: string;
  purchaseDate: string;
  soldAt?: string | null;
}) {
  const supabase = getSupabaseServerClient();
  const payload = {
    model_id: input.modelId,
    storage_gb: input.storageGb,
    color: input.color?.trim() || null,
    status: input.status,
    purchase_price: input.purchasePrice,
    repair_cost: input.repairCost,
    sale_price: input.salePrice ?? null,
    imei: input.imei?.trim() || null,
    notes: input.notes?.trim() || null,
    purchase_date: input.purchaseDate,
    sold_at: input.soldAt ?? null,
  };

  const { data, error } = await supabase
    .from("inventory_items")
    .insert(payload)
    .select(inventorySelect)
    .single();

  if (error) {
    throw error;
  }

  return mapInventoryItemRecord(data as InventoryItemRecord);
}

export async function updateInventoryItem(input: {
  id: string;
  modelId: string;
  storageGb: number;
  color?: string;
  status: InventoryItem["status"];
  purchasePrice: number;
  repairCost: number;
  salePrice?: number | null;
  imei?: string;
  notes?: string;
  purchaseDate: string;
  soldAt?: string | null;
}) {
  const supabase = getSupabaseServerClient();
  const payload = {
    model_id: input.modelId,
    storage_gb: input.storageGb,
    color: input.color?.trim() || null,
    status: input.status,
    purchase_price: input.purchasePrice,
    repair_cost: input.repairCost,
    sale_price: input.salePrice ?? null,
    imei: input.imei?.trim() || null,
    notes: input.notes?.trim() || null,
    purchase_date: input.purchaseDate,
    sold_at: input.soldAt ?? null,
  };

  const { data, error } = await supabase
    .from("inventory_items")
    .update(payload)
    .eq("id", input.id)
    .select(inventorySelect)
    .single();

  if (error) {
    throw error;
  }

  return mapInventoryItemRecord(data as InventoryItemRecord);
}

export async function deleteInventoryItem(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getInventorySummary(): Promise<InventorySummaryStat[]> {
  const items = await getInventoryItems();
  const totalSpend = items.reduce(
    (sum, item) => sum + item.purchasePrice + item.repairCost,
    0,
  );
  const itemsWithSalePrice = items.filter((item) => item.salePrice !== null);
  const potentialRevenue = itemsWithSalePrice.reduce(
    (sum, item) => sum + (item.salePrice ?? 0),
    0,
  );
  const potentialMargin = itemsWithSalePrice.reduce(
    (sum, item) => sum + (item.saleMargin ?? 0),
    0,
  );
  const itemsWithoutSalePrice = items.filter((item) => item.salePrice === null).length;

  return [
    {
      label: "Appareils suivis",
      value: String(items.length),
      detail: "tous statuts confondus",
    },
    {
      label: "Dépense globale",
      value: `${totalSpend} EUR`,
      detail: "achat + réparation sur tout le stock",
    },
    {
      label: "Vente potentielle",
      value: `${potentialRevenue} EUR`,
      detail: "sur les appareils avec prix de vente renseigné",
    },
    {
      label: "Marge potentielle",
      value: `${potentialMargin} EUR`,
      detail:
        itemsWithoutSalePrice > 0
          ? `${itemsWithoutSalePrice} appareil(s) sans prix de vente`
          : "tous les appareils ont un prix de vente",
    },
  ];
}

function mapInventoryItemRecord(record: InventoryItemRecord): InventoryItem {
  const modelName = Array.isArray(record.iphone_models)
    ? record.iphone_models[0]?.display_name
    : record.iphone_models?.display_name;

  return {
    id: record.id,
    modelId: record.model_id,
    modelName: modelName ?? "Modèle inconnu",
    storageGb: record.storage_gb,
    color: record.color,
    status: record.status,
    purchasePrice: record.purchase_price,
    repairCost: record.repair_cost,
    salePrice: record.sale_price,
    saleMargin: record.sale_margin,
    imei: record.imei,
    notes: record.notes,
    purchaseDate: record.purchase_date,
    soldAt: record.sold_at,
  };
}

const fallbackIphoneModels: IphoneModel[] = [
  "iPhone XR",
  "iPhone XS",
  "iPhone XS Max",
  "iPhone 11",
  "iPhone 11 Pro",
  "iPhone 11 Pro Max",
  "iPhone 12 mini",
  "iPhone 12",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13 mini",
  "iPhone 13",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
].map((displayName, index) => ({
  id: `fallback-${index + 1}`,
  slug: displayName.toLowerCase().replace(/\s+/g, "-"),
  displayName,
  sortOrder: (index + 1) * 10,
}));
