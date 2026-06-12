import { NextRequest, NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

// יומי 05:00 שעון ישראל — Content Agent מייצר פוסטים לתור (Phase 5)
export async function GET(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ job: "content", status: "stub", phase: 5 });
}
