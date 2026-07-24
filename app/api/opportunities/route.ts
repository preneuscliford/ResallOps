import { NextRequest, NextResponse } from "next/server";
import { createOpportunitySchema } from "@/lib/schemas";
import { createOpportunity, getOpportunities } from "@/lib/opportunities";
import { toApiErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const opportunities = await getOpportunities();

    return NextResponse.json({
      opportunities,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "GET /api/opportunities",
          error,
          "Impossible de charger les opportunites.",
        ),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createOpportunitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload invalide",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const opportunity = await createOpportunity(parsed.data);

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "POST /api/opportunities",
          error,
          "Impossible d'enregistrer l'opportunite.",
        ),
      },
      { status: 500 },
    );
  }
}
