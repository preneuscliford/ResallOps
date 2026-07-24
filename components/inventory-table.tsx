"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryForm } from "@/components/inventory-form";
import { InventoryItem, IphoneModel } from "@/types/inventory";

type InventoryTableProps = {
  items: InventoryItem[];
  models: IphoneModel[];
};

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

export function InventoryTable({ items, models }: InventoryTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "idle">("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(item: InventoryItem) {
    const confirmed = window.confirm(
      `Supprimer ${item.modelName} ${item.storageGb} Go du stock ? Cette action est définitive.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
      });
      const payload = await readJsonSafely(response);

      if (!response.ok) {
        setFeedback(payload.error ?? "Impossible de supprimer cet appareil.");
        setFeedbackTone("error");
        setDeletingId(null);
        return;
      }

      setFeedback("Appareil supprimé du stock.");
      setFeedbackTone("success");
      setDeletingId(null);
      if (editingId === item.id) {
        setEditingId(null);
      }
      router.refresh();
    } catch {
      setFeedback("La suppression a échoué. Vérifiez le serveur puis réessayez.");
      setFeedbackTone("error");
      setDeletingId(null);
    }
  }

  return (
    <div className="table-wrap">
      <div
        className={[
          "form-feedback",
          "inventory-table-feedback",
          feedbackTone === "success" ? "form-feedback-success" : "",
          feedbackTone === "error" ? "form-feedback-error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {feedback}
      </div>
      <table className="opportunity-table">
        <thead>
          <tr>
            <th>Appareil</th>
            <th>Statut</th>
            <th>Achat</th>
            <th>Réparation</th>
            <th>Vente</th>
            <th>Marge</th>
            <th>Suivi</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <Fragment key={item.id}>
                <tr>
                  <td>
                    <div className="table-title">
                      {item.modelName} {item.storageGb} Go
                    </div>
                    <div className="table-subtitle">{item.color ?? "Couleur non renseignée"}</div>
                  </td>
                  <td>{item.status}</td>
                  <td>{formatCurrency(item.purchasePrice)}</td>
                  <td>{formatCurrency(item.repairCost)}</td>
                  <td>{item.salePrice === null ? "-" : formatCurrency(item.salePrice)}</td>
                  <td>{item.saleMargin === null ? "-" : formatCurrency(item.saleMargin)}</td>
                  <td>
                    <div className="table-subtitle">
                      Achat : {formatDate(item.purchaseDate)}
                      <br />
                      {item.imei ? `Réf. : ${item.imei}` : "Réf. non renseignée"}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button-secondary"
                        onClick={() => {
                          setFeedback("");
                          setFeedbackTone("idle");
                          setEditingId(isEditing ? null : item.id);
                        }}
                        type="button"
                      >
                        {isEditing ? "Fermer" : "Modifier"}
                      </button>
                      <button
                        className="button-danger"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        type="button"
                      >
                        {deletingId === item.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
                {isEditing ? (
                  <tr>
                    <td className="table-editor-cell" colSpan={8}>
                      <div className="table-editor">
                        <div className="section-heading table-editor-heading">
                          <div>
                            <p className="section-kicker">Modification</p>
                            <h3>Mettre à jour l’appareil</h3>
                          </div>
                        </div>
                        <InventoryForm
                          item={item}
                          method="PATCH"
                          models={models}
                          onCancel={() => setEditingId(null)}
                          onSuccess={() => {
                            setEditingId(null);
                            setFeedback("Appareil modifié avec succès.");
                            setFeedbackTone("success");
                          }}
                          submitLabel="Enregistrer les modifications"
                          submitUrl={`/api/inventory/${item.id}`}
                          successMessage="Appareil modifié avec succès."
                        />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}
