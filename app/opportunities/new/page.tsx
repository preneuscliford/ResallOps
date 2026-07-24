import Link from "next/link";
import { OpportunityIntakeForm } from "@/components/opportunity-intake-form";

export default function NewOpportunityPage() {
  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Saisie</p>
            <h1 className="page-title">Ajouter une opportunite manuelle</h1>
          </div>
          <Link className="text-link" href="/">
            Retour au dashboard
          </Link>
        </div>
        <p className="hero-copy">
          Utilisez cette fiche pour alimenter votre base pendant que le collecteur
          automatique n&apos;est pas encore en place.
        </p>
        <OpportunityIntakeForm />
      </section>
    </main>
  );
}
