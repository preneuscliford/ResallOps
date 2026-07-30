"use client";

import { useState } from "react";
import Link from "next/link";
import { ACQUISITION_BUDGET_MAX, ACQUISITION_BUDGET_MIN } from "@/lib/budget";
import { EbaySearchResult } from "@/types/opportunity";

function buildStockLink(result: EbaySearchResult) {
  const params = new URLSearchParams({
    prefillPrice: String(result.askingPrice),
    prefillNotes: `${result.title} - ${result.url}`,
  });

  if (result.modelSlug) {
    params.set("prefillModel", result.modelSlug);
  }

  return `/inventory?${params.toString()}#ajouter`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SourceSyncPanel() {
  const [query, setQuery] = useState("iphone xr broken");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<EbaySearchResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  async function runSearch() {
    setIsSyncing(true);
    setStatus("");
    setResults([]);

    const response = await fetch("/api/sources/ebay/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "Impossible de lancer la recherche.");
      setIsSyncing(false);
      return;
    }

    setResults(payload.result.results);
    setStatus(
      payload.result.results.length > 0
        ? `${payload.result.results.length} annonce(s) trouvee(s) sur ${payload.result.totalFetched} analysee(s).`
        : `Aucune annonce eligible parmi les ${payload.result.totalFetched} analysee(s).`,
    );
    setIsSyncing(false);
  }

  return (
    <section className="panel sync-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Collecte</p>
          <h2>Premier connecteur automatique</h2>
        </div>
        <p className="section-note">
          Recherche en direct sur eBay. Rien n&apos;est enregistre tant que tu ne
          confirmes pas un achat.
        </p>
      </div>

      <p className="sync-budget-note">
        Le radar recherche seulement les annonces entre {ACQUISITION_BUDGET_MIN} EUR et{" "}
        {ACQUISITION_BUDGET_MAX} EUR et se limite aux iPhone XR et plus recents.
      </p>

      <div className="sync-controls">
        <label className="field">
          <span>Requete eBay</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="button-primary" disabled={isSyncing} onClick={runSearch} type="button">
          {isSyncing ? "Recherche..." : "Rechercher sur eBay"}
        </button>
      </div>

      <p className="sync-feedback">{status}</p>

      {results.length > 0 ? (
        <div className="table-wrap">
          <table className="opportunity-table">
            <thead>
              <tr>
                <th>Annonce</th>
                <th>Prix</th>
                <th>Revente</th>
                <th>Marge</th>
                <th>Risque</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.url}>
                  <td>
                    <div className="table-title">
                      <a href={result.url} target="_blank" rel="noreferrer">
                        {result.title}
                      </a>
                    </div>
                  </td>
                  <td data-label="Prix">{formatCurrency(result.askingPrice)}</td>
                  <td data-label="Revente">{formatCurrency(result.resaleEstimate)}</td>
                  <td data-label="Marge">{formatCurrency(result.estimatedMargin)}</td>
                  <td data-label="Risque">
                    <span className={`badge badge-${result.riskLevel.toLowerCase()}`}>
                      {result.riskLevel}
                    </span>
                  </td>
                  <td data-label="Score">
                    <strong>{result.score}/100</strong>
                  </td>
                  <td data-label="Action">
                    <Link className="button-secondary" href={buildStockLink(result)}>
                      Confirmer l&apos;achat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
