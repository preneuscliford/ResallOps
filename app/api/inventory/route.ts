import { NextRequest, NextResponse } from "next/server";
import { createInventoryItem, getInventoryItems, getIphoneModels } from "@/lib/inventory";
import { createInventoryItemSchema } from "@/lib/schemas";
import { toApiErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const [items, models] = await Promise.all([getInventoryItems(), getIphoneModels()]);
    return NextResponse.json({ items, models });
  } catch (error) {
    return NextResponse.json(
      { error: toApiErrorMessage("GET /api/inventory", error, "Impossible de charger le stock.") },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createInventoryItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const item = await createInventoryItem(parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "POST /api/inventory",
          error,
          "Impossible d'enregistrer cet appareil.",
        ),
      },
      { status: 500 },
    );
  }
}
