import { NextRequest, NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

// שבועי, ראשון 07:00 שעון ישראל — Optimizer Agent (Phase 8)
export async function GET(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ job: "optimizer", status: "stub", phase: 8 });
}
