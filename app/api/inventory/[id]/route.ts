import { NextRequest, NextResponse } from "next/server";
import { deleteInventoryItem, updateInventoryItem } from "@/lib/inventory";
import { updateInventoryItemSchema } from "@/lib/schemas";
import { toApiErrorMessage } from "@/lib/api-error";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await resolveParams(context);
    const body = await request.json();
    const parsed = updateInventoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload invalide", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const item = await updateInventoryItem({ id, ...parsed.data });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "PATCH /api/inventory/[id]",
          error,
          "Impossible de modifier cet appareil.",
        ),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await resolveParams(context);
    await deleteInventoryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "DELETE /api/inventory/[id]",
          error,
          "Impossible de supprimer cet appareil.",
        ),
      },
      { status: 500 },
    );
  }
}

async function resolveParams(context: RouteContext) {
  const params = await context.params;

  if (!params?.id) {
    throw new Error("Identifiant de stock manquant.");
  }

  return params;
}
