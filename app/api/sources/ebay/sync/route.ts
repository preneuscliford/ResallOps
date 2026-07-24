import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncEbayQuery } from "@/lib/opportunities";
import { toApiErrorMessage } from "@/lib/api-error";

const syncEbaySchema = z.object({
  query: z.string().min(3).default("iphone broken"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = syncEbaySchema.safeParse(body);

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
    const result = await syncEbayQuery(parsed.data.query);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          "POST /api/sources/ebay/sync",
          error,
          "La synchronisation eBay a echoue.",
        ),
      },
      { status: 500 },
    );
  }
}
