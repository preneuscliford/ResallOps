"use client";

import { useState } from "react";

const initialState = {
  title: "",
  platform: "Leboncoin",
  location: "",
  askingPrice: "",
  repairEstimate: "",
  resaleEstimate: "",
  locationScore: "5",
  riskPenalty: "10",
};

export function OpportunityIntakeForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const response = await fetch("/api/opportunities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        askingPrice: Number(form.askingPrice),
        repairEstimate: Number(form.repairEstimate),
        resaleEstimate: Number(form.resaleEstimate),
        locationScore: Number(form.locationScore),
        riskPenalty: Number(form.riskPenalty),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus({
        type: "error",
        message:
          payload.error ??
          "Impossible d'enregistrer cette opportunite pour le moment.",
      });
      setIsSubmitting(false);
      return;
    }

    setStatus({
      type: "success",
      message: `Opportunite creee avec un score de ${payload.opportunity.score}/100.`,
    });
    setForm(initialState);
    setIsSubmitting(false);
  }

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Titre</span>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="iPhone 13 128 Go - ecran casse"
          />
        </label>

        <label className="field">
          <span>Plateforme</span>
          <select
            value={form.platform}
            onChange={(event) => updateField("platform", event.target.value)}
          >
            <option>Leboncoin</option>
            <option>eBay</option>
            <option>Facebook Marketplace</option>
            <option>Rakuten</option>
            <option>Autre</option>
          </select>
        </label>

        <label className="field">
          <span>Localisation</span>
          <input
            required
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Paris 18e"
          />
        </label>

        <label className="field">
          <span>Prix demande</span>
          <input
            required
            min="0"
            step="1"
            type="number"
            value={form.askingPrice}
            onChange={(event) => updateField("askingPrice", event.target.value)}
            placeholder="220"
          />
        </label>

        <label className="field">
          <span>Reparation estimee</span>
          <input
            required
            min="0"
            step="1"
            type="number"
            value={form.repairEstimate}
            onChange={(event) => updateField("repairEstimate", event.target.value)}
            placeholder="65"
          />
        </label>

        <label className="field">
          <span>Revente estimee</span>
          <input
            required
            min="0"
            step="1"
            type="number"
            value={form.resaleEstimate}
            onChange={(event) => updateField("resaleEstimate", event.target.value)}
            placeholder="385"
          />
        </label>

        <label className="field">
          <span>Score localisation</span>
          <input
            min="0"
            max="10"
            step="1"
            type="number"
            value={form.locationScore}
            onChange={(event) => updateField("locationScore", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Penalite risque</span>
          <input
            min="0"
            max="50"
            step="1"
            type="number"
            value={form.riskPenalty}
            onChange={(event) => updateField("riskPenalty", event.target.value)}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enregistrement..." : "Creer l'opportunite"}
        </button>
        <p className={`form-feedback form-feedback-${status.type}`}>{status.message}</p>
      </div>
    </form>
  );
}
