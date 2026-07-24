"use client";

import { useState } from "react";
import { ACQUISITION_BUDGET_MAX, ACQUISITION_BUDGET_MIN } from "@/lib/budget";

export function SourceSyncPanel() {
  const [query, setQuery] = useState("iphone xr broken");
  const [status, setStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  async function runSync() {
    setIsSyncing(true);
    setStatus("");

    const response = await fetch("/api/sources/ebay/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "Impossible de lancer la synchronisation.");
      setIsSyncing(false);
      return;
    }

    setStatus(
      `${payload.result.imported} importe(s), ${payload.result.skipped} ignore(s), ${payload.result.totalFetched} annonce(s) analysee(s).`,
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
          V1 sur eBay pour valider la chaine d&apos;import avant d&apos;attaquer des
          sources plus dures.
        </p>
      </div>

      <p className="sync-budget-note">
        Le radar importe seulement les annonces entre {ACQUISITION_BUDGET_MIN} EUR et{" "}
        {ACQUISITION_BUDGET_MAX} EUR et se limite aux iPhone XR et plus recents.
      </p>

      <div className="sync-controls">
        <label className="field">
          <span>Requete eBay</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="button-primary" disabled={isSyncing} onClick={runSync} type="button">
          {isSyncing ? "Synchronisation..." : "Lancer une synchro eBay"}
        </button>
      </div>

      <p className="sync-feedback">{status}</p>
    </section>
  );
}
