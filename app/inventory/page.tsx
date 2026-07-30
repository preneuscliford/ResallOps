import Link from "next/link";
import { DashboardStats } from "@/components/dashboard-stats";
import { InventoryForm } from "@/components/inventory-form";
import { InventoryTable } from "@/components/inventory-table";
import { getInventoryItems, getInventorySummary, getIphoneModels } from "@/lib/inventory";

export const dynamic = "force-dynamic";

type InventoryPageProps = {
  searchParams: Promise<{
    prefillModel?: string;
    prefillPrice?: string;
    prefillNotes?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const [items, models, stats, params] = await Promise.all([
    getInventoryItems(),
    getIphoneModels(),
    getInventorySummary(),
    searchParams,
  ]);

  const prefill = {
    modelId: models.find((model) => model.slug === params.prefillModel)?.id,
    purchasePrice: params.prefillPrice,
    notes: params.prefillNotes,
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Stock</p>
          <h1>Suivez chaque iPhone que vous achetez et revendez.</h1>
          <p className="hero-copy">
            Centralisez le modèle, la capacité, le prix d’achat, le coût de
            réparation, le prix de vente et la marge dans Supabase.
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-card-label">Accès rapide</p>
          <ul className="hero-list">
            <li>Stock relié à Supabase</li>
            <li>Menu déroulant pour les modèles</li>
            <li>Marge calculée automatiquement</li>
            <li>Suivi du statut appareil par appareil</li>
          </ul>
          <Link className="button-primary hero-button" href="/">
            Retour au radar
          </Link>
        </div>
      </section>

      <DashboardStats stats={stats} />

      <section className="panel" id="ajouter">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Saisie</p>
            <h2>Ajouter un appareil au stock</h2>
          </div>
        </div>
        <InventoryForm models={models} prefill={prefill} />
      </section>

      <section className="panel inventory-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Inventaire</p>
            <h2>Vue complète du stock</h2>
          </div>
        </div>
        <InventoryTable items={items} models={models} />
      </section>
    </main>
  );
}
