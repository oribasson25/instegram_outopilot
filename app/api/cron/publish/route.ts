import { NextRequest, NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

// כל 10 דקות — מפרסם פוסטים scheduled שהגיע זמנם (Phase 3)
export async function GET(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ job: "publish", status: "stub", phase: 3 });
}
