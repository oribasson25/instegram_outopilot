import { NextRequest, NextResponse } from "next/server";

// אימות קריאות cron — Vercel שולח Authorization: Bearer ${CRON_SECRET}
export function verifyCron(request: NextRequest): NextResponse | null {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
