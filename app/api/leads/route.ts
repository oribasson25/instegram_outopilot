import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal("")),
  utm: z.string().max(50).optional(),
  website: z.string().max(0).optional(), // honeypot — חייב להישאר ריק
});

// קליטת ליד מדף הנחיתה. שמירה ל-DB + ייחוס לפוסט ייבנו ב-Phase 7.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed" }, { status: 400 });
  }

  // honeypot מולא → בוט; מחזירים הצלחה מדומה
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  // Phase 7: שמירה ב-leads, ייחוס לפי utm, עדכון leads_attributed, lead scoring
  return NextResponse.json({ ok: true, message: "Phase 7 — persistence coming" });
}
