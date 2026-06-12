import { NextResponse } from "next/server";

// OAuth callback של Meta — החלפת code ל-long-lived token, שליפת Page +
// instagram_business_account ושמירה מוצפנת. ייבנה ב-Phase 2.
export async function GET() {
  return NextResponse.json({ status: "stub", phase: 2 });
}
