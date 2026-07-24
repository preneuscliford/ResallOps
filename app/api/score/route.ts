import { NextRequest, NextResponse } from "next/server";
import { scoreOpportunityInputSchema } from "@/lib/schemas";
import { estimateOpportunity } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = scoreOpportunityInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    result: estimateOpportunity(parsed.data),
  });
}
