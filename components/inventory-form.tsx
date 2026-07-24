"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryItem, IphoneModel } from "@/types/inventory";

type InventoryFormProps = {
  models: IphoneModel[];
  item?: InventoryItem;
  submitUrl?: string;
  method?: "POST" | "PATCH";
  submitLabel?: string;
  successMessage?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const colorOptions = [
  "Noir",
  "Blanc",
  "Bleu",
  "Rouge",
  "Vert",
  "Jaune",
  "Rose",
  "Violet",
  "Argent",
  "Or",
  "Graphite",
  "Minuit",
  "Lumière stellaire",
  "Corail",
];

function createInitialForm(models: IphoneModel[], item?: InventoryItem) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    modelId: item?.modelId ?? models[0]?.id ?? "",
    storageGb: String(item?.storageGb ?? 128),
    color: item?.color ?? "",
    status: item?.status ?? "En stock",
    purchasePrice: item ? String(item.purchasePrice) : "",
    repairCost: String(item?.repairCost ?? 0),
    salePrice: item?.salePrice === null || item?.salePrice === undefined ? "" : String(item.salePrice),
    imei: item?.imei ?? "",
    notes: item?.notes ?? "",
    purchaseDate: item?.purchaseDate ?? today,
    soldAt: item?.soldAt ?? "",
  };
}

async function readJsonSafely(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text) {
    return {};
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  return { error: text };
}

export function InventoryForm({
  models,
  item,
  submitUrl,
  method = "POST",
  submitLabel,
  successMessage,
  onCancel,
  onSuccess,
}: InventoryFormProps) {
  const router = useRouter();
  const initialForm = useMemo(() => createInitialForm(models, item), [item, models]);
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | "idle">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusTone("idle");

    try {
      const response = await fetch(submitUrl ?? "/api/inventory", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: form.modelId,
          storageGb: Number(form.storageGb),
          color: form.color,
          status: form.status,
          purchasePrice: Number(form.purchasePrice),
          repairCost: Number(form.repairCost),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          imei: form.imei,
          notes: form.notes,
          purchaseDate: form.purchaseDate,
          soldAt: form.soldAt || null,
        }),
      });

      const payload = await readJsonSafely(response);

      if (!response.ok) {
        setStatusMessage(payload.error ?? "Erreur lors de l’enregistrement.");
        setStatusTone("error");
        setIsSubmitting(false);
        return;
      }

      setStatusMessage(successMessage ?? "Appareil enregistré dans le stock.");
      setStatusTone("success");

      if (method === "POST") {
        setForm(createInitialForm(models));
      }

      setIsSubmitting(false);
      onSuccess?.();
      router.refresh();
    } catch {
      setStatusMessage("La requête a échoué. Vérifiez le serveur puis réessayez.");
      setStatusTone("error");
      setIsSubmitting(false);
    }
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form className="inventory-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Modèle</span>
          <select value={form.modelId} onChange={(event) => updateField("modelId", event.target.value)}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Capacité</span>
          <select
            value={form.storageGb}
            onChange={(event) => updateField("storageGb", event.target.value)}
          >
            <option value="64">64 Go</option>
            <option value="128">128 Go</option>
            <option value="256">256 Go</option>
            <option value="512">512 Go</option>
            <option value="1024">1 To</option>
          </select>
        </label>

        <label className="field">
          <span>Couleur</span>
          <select value={form.color} onChange={(event) => updateField("color", event.target.value)}>
            <option value="">Choisir une couleur</option>
            {colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Statut</span>
          <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            <option>En stock</option>
            <option>En reparation</option>
            <option>Pret a vendre</option>
            <option>Vendu</option>
          </select>
        </label>

        <label className="field">
          <span>Prix d’achat</span>
          <input
            min="0"
            required
            type="number"
            value={form.purchasePrice}
            onChange={(event) => updateField("purchasePrice", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Coût de réparation</span>
          <input
            min="0"
            required
            type="number"
            value={form.repairCost}
            onChange={(event) => updateField("repairCost", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Prix de vente</span>
          <input
            min="0"
            type="number"
            value={form.salePrice}
            onChange={(event) => updateField("salePrice", event.target.value)}
          />
        </label>

        <label className="field">
          <span>IMEI / référence</span>
          <input value={form.imei} onChange={(event) => updateField("imei", event.target.value)} />
        </label>

        <label className="field">
          <span>Date d’achat</span>
          <input
            required
            type="date"
            value={form.purchaseDate}
            onChange={(event) => updateField("purchaseDate", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Date de vente</span>
          <input type="date" value={form.soldAt} onChange={(event) => updateField("soldAt", event.target.value)} />
        </label>

        <label className="field field-full">
          <span>Notes</span>
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enregistrement..." : submitLabel ?? "Ajouter au stock"}
        </button>
        {onCancel ? (
          <button className="button-secondary" onClick={onCancel} type="button">
            Annuler
          </button>
        ) : null}
        <p
          className={[
            "form-feedback",
            statusTone === "success" ? "form-feedback-success" : "",
            statusTone === "error" ? "form-feedback-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}
