import { NextRequest, NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

// יומי 03:00 שעון ישראל — איסוף insights + Analytics Agent (Phase 4)
export async function GET(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ job: "analytics", status: "stub", phase: 4 });
}
