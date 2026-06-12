import { NextRequest, NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

// שבועי — Reporter מייצר דוח עברית (Phase 8)
export async function GET(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ job: "report", status: "stub", phase: 8 });
}
