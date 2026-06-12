import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../lib/db/schema";

// נתוני דמו כדי שכל המסכים ייראו חיים מהיום הראשון (הערה 14 באפיון)
async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL לא מוגדר ב-.env.local");
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL), { schema });

  console.log("🌱 מתחיל seed...");

  const [account] = await db
    .insert(schema.accounts)
    .values({
      igUserId: "17841400000000000",
      fbPageId: "100000000000000",
      accessToken: "demo-token-not-encrypted",
      username: "demo_business",
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    })
    .returning();

  await db.insert(schema.brandProfile).values({
    accountId: account.id,
    businessField: "קליניקת קוסמטיקה מתקדמת",
    audience: "נשים 25–45, אזור המרכז, מתעניינות בטיפוח עור",
    tone: "חם, מקצועי, עם נגיעה אישית",
    offer: "טיפולי פנים מתקדמים + תוכנית ליווי עור אישית",
    defaultCta: "שלחו 'עור' בתגובה ונחזור אליכן בפרטי 💌",
    contentPillars: ["טיפים", "מאחורי הקלעים", "הוכחה חברתית", "מבצעים"],
    autonomyMode: "approval",
  });

  await db.insert(schema.presenter).values({
    accountId: account.id,
    name: "דנה",
    referenceImages: [],
    trainingStatus: "pending",
  });

  const pillars = ["טיפים", "מאחורי הקלעים", "הוכחה חברתית", "מבצעים"];
  const hooks = [
    "3 טעויות שכולן עושות בניקוי פנים 😱",
    "ככה נראה יום עבודה אצלנו בקליניקה ✨",
    "הלקוחה הזו לא האמינה לתוצאה אחרי 3 טיפולים",
    "רק השבוע: טיפול היכרות ב-50% הנחה 🎁",
    "המרכיב האחד שחסר לך בשגרת הטיפוח",
    "שאלתן ועניתי: כל האמת על חומצה היאלורונית",
  ];

  const now = Date.now();
  const postIds: string[] = [];

  for (let i = 0; i < 6; i++) {
    const isPublished = i < 4;
    const [post] = await db
      .insert(schema.posts)
      .values({
        accountId: account.id,
        status: isPublished ? "published" : i === 4 ? "scheduled" : "draft",
        contentPillar: pillars[i % 4],
        hook: hooks[i],
        caption: `${hooks[i]}\n\nכאן יבוא קפשן מלא שנכתב על ידי ה-Content Agent לפי DNA המותג: טון חם ומקצועי, פנייה ישירה לקהל היעד, וסיום ב-CTA.\n\nשלחו "עור" בתגובה ונחזור אליכן בפרטי 💌`,
        hashtags: ["קוסמטיקה", "טיפוחעור", "טיפולפנים", "ביוטי"],
        dmKeyword: "עור",
        dmMessage: "היי! הנה כל הפרטים שביקשת 💌 https://example.com/lp/demo" + i,
        utmCode: `demo-${i}`,
        scheduledAt: isPublished
          ? null
          : new Date(now + (i - 3) * 24 * 60 * 60 * 1000),
        publishedAt: isPublished
          ? new Date(now - (8 - i * 2) * 24 * 60 * 60 * 1000)
          : null,
        igMediaId: isPublished ? `1784000000000${i}` : null,
        createdBy: "agent",
        generationReasoning:
          "פוסט דמו: נבחר pillar עם ביצועים גבוהים בשבועיים האחרונים, hook בסגנון שאלה שהניב saves גבוהים.",
      })
      .returning();
    postIds.push(post.id);

    if (isPublished) {
      await db.insert(schema.postMetrics).values({
        postId: post.id,
        impressions: 2400 + i * 800,
        reach: 1900 + i * 650,
        likes: 130 + i * 45,
        comments: 12 + i * 8,
        saves: 25 + i * 12,
        shares: 6 + i * 3,
        profileVisits: 40 + i * 15,
        follows: 5 + i * 3,
        leadsAttributed: i * 2,
      });
    }
  }

  for (let d = 0; d < 14; d++) {
    await db.insert(schema.accountMetrics).values({
      accountId: account.id,
      date: new Date(now - d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      followers: 3200 - d * 12,
      reach: 1500 + Math.round(Math.random() * 900),
      profileViews: 80 + Math.round(Math.random() * 60),
      websiteClicks: 10 + Math.round(Math.random() * 15),
    });
  }

  const leadNames = ["נועה לוי", "שירה כהן", "מאיה אברהם", "טל בן-דוד", "יעל מזרחי"];
  for (let i = 0; i < leadNames.length; i++) {
    await db.insert(schema.leads).values({
      accountId: account.id,
      name: leadNames[i],
      phone: `05${2 + (i % 3)}-${1000000 + i * 111111}`,
      email: i % 2 === 0 ? `lead${i}@example.com` : null,
      source: i % 2 === 0 ? "landing_page" : "dm",
      sourcePostId: postIds[i % 4],
      utmCode: `demo-${i % 4}`,
      status: ["new", "new", "contacted", "qualified", "won"][i],
      score: 40 + i * 12,
    });
  }

  await db.insert(schema.recommendations).values([
    {
      accountId: account.id,
      type: "schedule_change",
      title: "להזיז פרסומים לשעות הערב",
      body: "פוסטים שפורסמו בין 19:00–21:00 הניבו engagement גבוה ב-32% מהממוצע. מומלץ להעביר את הפרסום הקבוע של ימי שלישי ל-19:30.",
      data: { day: 2, from_hour: 12, to_hour: 19, uplift: 0.32 },
    },
    {
      accountId: account.id,
      type: "paid_promotion",
      title: "לקדם את פוסט ההוכחה החברתית",
      body: "הפוסט 'הלקוחה הזו לא האמינה לתוצאה' מביא לידים בעלות הנמוכה ביותר. מומלץ תקציב של 200 ₪ ל-5 ימים.",
      data: { post_index: 2, suggested_budget: 200, duration_days: 5 },
    },
  ]);

  const slots = [
    { dayOfWeek: 0, hour: 20, score: "0.81", sampleSize: 6 },
    { dayOfWeek: 2, hour: 19, score: "0.87", sampleSize: 8 },
    { dayOfWeek: 4, hour: 12, score: "0.74", sampleSize: 5 },
  ];
  for (const s of slots) {
    await db.insert(schema.optimalSlots).values({ accountId: account.id, ...s });
  }

  await db.insert(schema.agentRuns).values([
    {
      agent: "analytics",
      startedAt: new Date(now - 6 * 60 * 60 * 1000),
      finishedAt: new Date(now - 6 * 60 * 60 * 1000 + 45000),
      status: "success",
      summary: "נותחו 4 פוסטים; זוהה דפוס מנצח: hooks בסגנון שאלה בשעות הערב.",
    },
    {
      agent: "content",
      startedAt: new Date(now - 4 * 60 * 60 * 1000),
      finishedAt: new Date(now - 4 * 60 * 60 * 1000 + 90000),
      status: "success",
      summary: "נוצרו 2 טיוטות פוסטים והועברו לתור לאישור.",
    },
  ]);

  console.log("✅ seed הושלם: חשבון, מותג, פרזנטור, 6 פוסטים, מטריקות, 5 לידים, המלצות, שעות זהב");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
