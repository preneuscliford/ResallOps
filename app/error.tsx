"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="section-kicker">Erreur</p>
        <h1 className="page-title">Une erreur est survenue.</h1>
        <p className="hero-copy">
          La connexion a Supabase ou une autre dependance a echoue. Reessayez
          dans un instant.
        </p>
        <div className="form-actions">
          <button className="button-primary" onClick={reset} type="button">
            Reessayer
          </button>
        </div>
      </section>
    </main>
  );
}
