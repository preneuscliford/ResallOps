export type IphoneModel = {
  id: string;
  slug: string;
  displayName: string;
  sortOrder: number;
};

export type InventoryItem = {
  id: string;
  modelId: string;
  modelName: string;
  storageGb: number;
  color: string | null;
  status: "En stock" | "En reparation" | "Pret a vendre" | "Vendu";
  purchasePrice: number;
  repairCost: number;
  salePrice: number | null;
  saleMargin: number | null;
  imei: string | null;
  notes: string | null;
  purchaseDate: string;
  soldAt: string | null;
};

export type InventoryItemRecord = {
  id: string;
  model_id: string;
  storage_gb: number;
  color: string | null;
  status: InventoryItem["status"];
  purchase_price: number;
  repair_cost: number;
  sale_price: number | null;
  sale_margin: number | null;
  imei: string | null;
  notes: string | null;
  purchase_date: string;
  sold_at: string | null;
  iphone_models:
    | Array<{
        display_name: string;
      }>
    | {
        display_name: string;
      }
    | null;
};

export type IphoneModelRecord = {
  id: string;
  slug: string;
  display_name: string;
  sort_order: number;
};

export type InventorySummaryStat = {
  label: string;
  value: string;
  detail: string;
};
