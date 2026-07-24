import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "resallops-radar",
    timestamp: new Date().toISOString(),
  });
}
