import { OpportunityBoard } from "@/components/opportunity-board";
import { DashboardStats } from "@/components/dashboard-stats";
import { SourceSyncPanel } from "@/components/source-sync-panel";
import { getOpportunities, getOpportunitySummary } from "@/lib/opportunities";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [opportunities, stats] = await Promise.all([
    getOpportunities(),
    getOpportunitySummary(),
  ]);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Radar d opportunites</p>
          <h1>Reperez les iPhone rentables avant les autres.</h1>
          <p className="hero-copy">
            Une base de travail pour centraliser les annonces, scorer leur potentiel
            et prioriser les prises de contact sur les iPhone XR et plus recents.
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-card-label">Etat du MVP</p>
          <ul className="hero-list">
            <li>Dashboard decisionnel</li>
            <li>Tableau d opportunites</li>
            <li>API de scoring</li>
            <li>Stock relie a Supabase</li>
          </ul>
          <div className="hero-actions">
            <Link className="button-primary hero-button" href="/inventory">
              Ouvrir le stock
            </Link>
            <Link className="text-link hero-text-link" href="/opportunities/new">
              Ajouter une opportunite
            </Link>
          </div>
        </div>
      </section>

      <DashboardStats stats={stats} />

      <SourceSyncPanel />

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Opportunites</p>
            <h2>Vue priorisee des annonces</h2>
          </div>
          <p className="section-note">
            Vue en francais, filtree sur votre budget actuel et sur les modeles a
            partir de XR.
          </p>
        </div>
        <OpportunityBoard opportunities={opportunities} />
      </section>
    </main>
  );
}
