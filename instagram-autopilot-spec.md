# InstaPilot — מערכת ניהול עסק אוטונומית לאינסטגרם
## מסמך אפיון מלא ל-Claude Code

> **הוראה ל-Claude Code:** בנה את המערכת לפי המסמך הזה, שלב אחרי שלב לפי סדר ה-Phases בסוף. אחרי כל Phase עצור, הרץ בדיקות, והצג סיכום לפני המשך.

---

## 1. סקירה כללית

מערכת web אחת שבה המשתמש מגדיר פעם אחת חשבון אינסטגרם עסקי + תמונות פרזנטור + פרופיל מותג, ומאותו רגע המערכת פועלת אוטונומית:

1. מייצרת פוסטים (תמונה עם פרזנטור קבוע + קפשן) לפי "DNA המותג"
2. מפרסמת לפי לוח זמנים חכם
3. אוספת אנליטיקות מדי לילה ולומדת מה עובד
4. מייצרת את הפוסטים הבאים על בסיס מה שהצליח
5. Comment-to-DM: תגובה עם מילת מפתח → DM אוטומטי עם לינק לדף נחיתה
6. דף נחיתה מובנה → לידים נכנסים ישירות ל-CRM הפנימי
7. ממליצה על שינוי שעות פרסום, קידום ממומן וקהלי יעד
8. דוח שבועי אוטומטי

## 2. Stack

| רכיב | טכנולוגיה |
|---|---|
| Hosting | **Vercel** (Next.js 15, App Router, TypeScript) |
| DB | **Neon** (Postgres serverless) דרך **Drizzle ORM** + `@neondatabase/serverless` |
| Jobs מתוזמנים | **Vercel Cron** (מוגדר ב-`vercel.json`) |
| AI (סוכנים) | **Claude API** — Anthropic SDK (`@anthropic-ai/sdk`), מודל `claude-sonnet-4-6`. תיעוד: https://docs.claude.com/en/api/overview |
| יצירת תמונות פרזנטור | ספק עם identity model (ראה סעיף 7) מאחורי interface מופשט `ImageProvider` |
| Meta | Instagram Graph API + Marketing API (v21.0+) |
| UI | Tailwind + shadcn/ui, RTL מלא (עברית) |
| Auth למערכת | NextAuth (email magic link) — משתמש יחיד בשלב ראשון |
| Storage לתמונות | Vercel Blob |

## 3. משתני סביבה (.env)

```
DATABASE_URL=            # Neon connection string (pooled)
ANTHROPIC_API_KEY=
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=   # מחרוזת אקראית שנגדיר
NEXTAUTH_SECRET=
NEXTAUTH_URL=
BLOB_READ_WRITE_TOKEN=
IMAGE_PROVIDER_API_KEY=      # ספק יצירת התמונות
CRON_SECRET=                 # אימות קריאות cron
```

## 4. סכמת DB (Drizzle / Postgres)

```sql
-- חיבור החשבון (משתמש יחיד, אבל מוכן לריבוי)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT NOT NULL,            -- Instagram Business Account ID
  fb_page_id TEXT NOT NULL,
  access_token TEXT NOT NULL,          -- long-lived token (מוצפן!)
  token_expires_at TIMESTAMPTZ,
  username TEXT,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- DNA של המותג
CREATE TABLE brand_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  business_field TEXT,          -- תחום העסק
  audience TEXT,                -- קהל יעד
  tone TEXT,                    -- טון דיבור
  offer TEXT,                   -- מה מוכרים
  default_cta TEXT,
  language TEXT DEFAULT 'he',
  content_pillars JSONB,        -- ["טיפים","מאחורי הקלעים","הוכחה חברתית","מבצעים"]
  autonomy_mode TEXT DEFAULT 'approval'  -- approval | full_auto
);

-- פרזנטור
CREATE TABLE presenter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT,
  reference_images JSONB,       -- URLs ב-Blob
  identity_model_id TEXT,       -- ID של המודל המאומן אצל הספק
  training_status TEXT DEFAULT 'pending'  -- pending|training|ready|failed
);

-- פוסטים
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'draft',  -- draft|approved|scheduled|published|failed|rejected
  content_pillar TEXT,
  hook TEXT,                    -- שורת הפתיחה (ל-A/B ולמידה)
  caption TEXT,
  hashtags TEXT[],
  image_url TEXT,
  image_prompt TEXT,
  dm_keyword TEXT,              -- מילת ההפעלה ל-comment-to-dm
  dm_message TEXT,              -- ההודעה שתישלח ב-DM (כוללת לינק עם UTM)
  utm_code TEXT UNIQUE,         -- מזהה ייחוס לדף הנחיתה
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  ig_media_id TEXT,             -- מזהה הפוסט באינסטגרם אחרי פרסום
  created_by TEXT DEFAULT 'agent',
  generation_reasoning TEXT     -- למה הסוכן יצר את זה (שקיפות)
);

-- אנליטיקות (snapshot יומי לכל פוסט)
CREATE TABLE post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id),
  captured_at TIMESTAMPTZ DEFAULT now(),
  impressions INT, reach INT, likes INT, comments INT,
  saves INT, shares INT, profile_visits INT,
  follows INT, video_views INT,
  leads_attributed INT DEFAULT 0   -- לידים שהגיעו מהפוסט (לפי UTM)
);

-- מטריקות חשבון יומיות
CREATE TABLE account_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  date DATE,
  followers INT, reach INT, profile_views INT, website_clicks INT
);

-- לידים (CRM)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT, phone TEXT, email TEXT,
  source TEXT,                  -- landing_page | dm | manual
  source_post_id UUID REFERENCES posts(id),
  utm_code TEXT,
  status TEXT DEFAULT 'new',    -- new|contacted|qualified|won|lost
  score INT,                    -- lead scoring 1-100
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- אירועי comment-to-dm
CREATE TABLE dm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id),
  ig_comment_id TEXT UNIQUE,    -- מניעת כפילויות
  commenter_username TEXT,
  comment_text TEXT,
  dm_sent BOOLEAN DEFAULT false,
  dm_sent_at TIMESTAMPTZ,
  error TEXT
);

-- המלצות שהמערכת מייצרת
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  type TEXT,        -- schedule_change | content_topic | paid_promotion | audience
  title TEXT,
  body TEXT,
  data JSONB,       -- פרטים מובנים (למשל: { "post_id":..., "suggested_budget": 200, "audience": {...} })
  status TEXT DEFAULT 'pending',   -- pending|accepted|dismissed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- לוח שעות זהב (נלמד מהדאטה)
CREATE TABLE optimal_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  day_of_week INT,              -- 0-6
  hour INT,                     -- 0-23 (שעון ישראל)
  score NUMERIC,                -- engagement ממוצע מנורמל
  sample_size INT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT,                   -- content|analytics|optimizer|reporter
  started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ,
  status TEXT, summary TEXT, error TEXT
);
```

## 5. מבנה תיקיות

```
/app
  /(dashboard)
    /page.tsx                 # Dashboard ראשי
    /queue/page.tsx           # תור תוכן (אישור/עריכה)
    /calendar/page.tsx        # לוח פרסום
    /leads/page.tsx           # CRM
    /insights/page.tsx        # אנליטיקות + המלצות
    /settings/page.tsx        # חשבון, פרזנטור, DNA, autonomy
  /onboarding
    /connect/page.tsx         # OAuth Meta
    /presenter/page.tsx       # העלאת תמונות + אימון
    /brand/page.tsx           # שאלון DNA
  /lp/[utm]/page.tsx          # דף נחיתה דינמי (public)
  /api
    /auth/meta/callback/route.ts
    /webhooks/meta/route.ts   # GET=verify, POST=events
    /leads/route.ts           # POST מדף הנחיתה
    /cron
      /publish/route.ts       # כל 10 דק'
      /analytics/route.ts     # יומי 03:00
      /content/route.ts       # יומי 05:00
      /optimizer/route.ts     # שבועי
      /report/route.ts        # שבועי
/lib
  /db (drizzle schema + client)
  /meta
    client.ts                 # קריאות Graph API
    publish.ts                # container → publish flow
    insights.ts
    private-reply.ts
  /agents
    content-agent.ts
    analytics-agent.ts
    optimizer-agent.ts
    dm-classifier.ts
    prompts.ts                # כל פרומפטי הסוכנים במקום אחד
  /image-provider
    index.ts                  # interface: trainIdentity(), generateWithPresenter()
  /crypto.ts                  # הצפנת tokens
/vercel.json                  # הגדרות cron
```

## 6. אינטגרציית Meta — פירוט

### 6.1 OAuth + חיבור
- Facebook Login for Business → קבלת user token → החלפה ל-long-lived → שליפת Page + `instagram_business_account`.
- הרשאות נדרשות (דורש App Review): `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `ads_management` (להמלצות ממומן).
- רענון token אוטומטי לפני תפוגה (cron יומי בודק `token_expires_at`).

### 6.2 פרסום פוסט
```
POST /{ig-user-id}/media        (image_url, caption)  → creation_id
GET  /{creation_id}?fields=status_code   (פולינג עד FINISHED)
POST /{ig-user-id}/media_publish (creation_id)        → ig_media_id
```

### 6.3 Webhooks (comment-to-dm)
- רישום ל-field: `comments` (ול-`messages` להמשך).
- POST נכנס → אימות חתימה (`X-Hub-Signature-256` עם APP_SECRET) → אם `comment.text` מכיל את `dm_keyword` של הפוסט (התאמה לא תלוית רישיות, כולל וריאציות בעברית):
  1. רישום ב-`dm_events` (idempotent לפי `ig_comment_id`)
  2. שליחת **Private Reply**: `POST /{ig-comment-id}/private_replies` עם `dm_message`
  3. אופציונלי: תגובה פומבית קצרה ("שלחנו לך הודעה 💌")
- **מגבלות Meta שחובה לכבד:** Private Reply אחת בלבד לכל תגובה; חלון 24 שעות להמשך שיחה; אין שליחת DM יזום למי שלא יצר קשר.

### 6.4 Insights
- לכל פוסט: `GET /{ig-media-id}/insights?metric=impressions,reach,likes,comments,saved,shares,profile_visits,follows`
- לחשבון: `GET /{ig-user-id}/insights?metric=reach,profile_views,website_clicks,follower_count&period=day`

## 7. פרזנטור — Identity Model

interface מופשט כדי שאפשר להחליף ספק:

```ts
interface ImageProvider {
  trainIdentity(images: string[]): Promise<{ modelId: string }>;
  getTrainingStatus(modelId: string): Promise<'training'|'ready'|'failed'>;
  generateWithPresenter(modelId: string, prompt: string, aspectRatio: '1:1'|'4:5'): Promise<{ url: string }>;
}
```

מימוש ראשון: ספק שתומך באימון זהות מ-5–20 תמונות (למשל Higgsfield Soul API או Replicate flux-LoRA). ה-onboarding: העלאה ל-Blob → `trainIdentity` → פולינג סטטוס → `training_status='ready'`.

**כלל ברזל:** הסוכן לא מייצר פוסט עם תמונת פרזנטור אם הסטטוס אינו ready (fallback: תמונת גרפיקה ללא פרזנטור + סימון לאישור ידני).

## 8. הסוכנים (Claude API)

כל סוכן = פונקציה שרצה בתוך route של cron, קוראת ל-Claude עם system prompt ייעודי, ומחזירה **JSON בלבד** (לאכוף בפרומפט + לפרסר עם נפילה רכה). כל ריצה נרשמת ב-`agent_runs`.

### 8.1 Analytics Agent (יומי 03:00)
קלט: כל המטריקות מ-30 הימים האחרונים + מאפייני הפוסטים (pillar, hook, שעה, מילת DM, לידים מיוחסים).
פלט JSON:
```json
{
  "winning_patterns": ["..."],
  "losing_patterns": ["..."],
  "optimal_slots": [{"day":2,"hour":19,"score":0.87}],
  "schedule_recommendations": [{"post_id":"...","move_to":"..."}],
  "insights_summary": "..."
}
```
המערכת מעדכנת `optimal_slots` ויוצרת `recommendations` מסוג `schedule_change` כשהפער מובהק (לפחות 15 פוסטים בדגימה ופער של 25%+ ב-engagement).

### 8.2 Content Agent (יומי 05:00, רק אם בתור פחות מ-X פוסטים)
קלט: brand_profile + winning/losing patterns + 10 הפוסטים האחרונים (למניעת חזרתיות).
פלט: 2–4 פוסטים — לכל אחד: pillar, hook, caption (עברית, RTL, אימוג'ים במידה), hashtags, image_prompt (אנגלית, מתאר סצנה עם הפרזנטור), dm_keyword, dm_message, reasoning.
→ יצירת תמונה דרך ImageProvider → שמירה כ-draft (או scheduled אם `full_auto`) → שיבוץ ל-slot הפנוי הטוב ביותר מ-`optimal_slots`.

### 8.3 Optimizer Agent (שבועי, ראשון 07:00)
קלט: סיכום שבועי + עלות-לליד היפותטית.
פלט: המלצות `paid_promotion` (איזה פוסט להריץ כממומן, תקציב מוצע, משך) ו-`audience` (הגדרת קהל ל-Marketing API: גילאים, מיקומים, תחומי עניין, Lookalike ממעורבים/לידים). ההמלצות מוצגות ב-Insights עם כפתור "צור קהל" שמפעיל `POST /act_{ad_account}/customaudiences`.

### 8.4 DM Classifier (בזמן אמת, מתוך ה-webhook)
מסווג תגובות שלא הכילו keyword מדויק אבל מביעות כוונה ("איך מצטרפים?", "כמה עולה?") → טריגר ל-DM גם בלעדיה. בנוסף מסמן sentiment שלילי לתשומת לב.

### 8.5 Reporter (שבועי)
מייצר דוח עברית קריא: פוסטים מובילים, לידים, עלות-לליד, ההמלצה המרכזית של השבוע. נשמר ומוצג ב-Dashboard (שלב 2: שליחה למייל).

## 9. דף נחיתה ולידים

- Route ציבורי `/lp/[utm]` — נטען מהיר, RTL, מותאם מובייל: כותרת, תועלות, תמונת פרזנטור, טופס (שם, טלפון, אימייל אופציונלי), הוכחה חברתית.
- התוכן נגזר אוטומטית מ-brand_profile + הפוסט שאליו ה-UTM שייך (התאמת מסר!).
- שליחה → `POST /api/leads` → שמירה עם `source_post_id` לפי utm → עדכון `leads_attributed` → Toast "נחזור אליך".
- Lead Scoring: ניקוד בסיסי לפי שלמות פרטים + מקור + מהירות תגובה ב-DM.

## 10. Scheduler

- `vercel.json`:
```json
{ "crons": [
  { "path": "/api/cron/publish",   "schedule": "*/10 * * * *" },
  { "path": "/api/cron/analytics", "schedule": "0 1 * * *" },
  { "path": "/api/cron/content",   "schedule": "0 3 * * *" },
  { "path": "/api/cron/optimizer", "schedule": "0 5 * * 0" },
  { "path": "/api/cron/report",    "schedule": "30 5 * * 0" }
] }
```
(השעות ב-UTC; להמיר לשעון ישראל בקוד.)
- כל route של cron מאמת `Authorization: Bearer ${CRON_SECRET}`.
- publish: שולף פוסטים scheduled שהגיע זמנם → מפרסם → מעדכן סטטוס → במקרה כשל: retry x2 ואז `failed` + התראה ב-Dashboard.

## 11. מסכי ה-UI (תמצית)

1. **Dashboard** — כרטיסים: לידים היום/שבוע, הפוסט הבא, המלצה חמה אחת, סטטוס סוכנים אחרון.
2. **Queue** — כרטיסי פוסט (תמונה+קפשן+reasoning), פעולות: אשר / ערוך / דחה / ייצר מחדש.
3. **Calendar** — שבועי, drag&drop לשינוי מועד, badge "שעת זהב" על slots מומלצים.
4. **Leads** — טבלה + פילטרים, שינוי סטטוס, עמודת "פוסט מקור".
5. **Insights** — גרפים (engagement לפי pillar/שעה/יום), טבלת פוסטים, רשימת recommendations עם אשר/דחה.
6. **Settings** — חיבור Meta, ניהול פרזנטור, עריכת DNA, מצב autonomy, מילות DM ברירת מחדל.

## 12. אבטחה

- access_token מוצפן ב-DB (AES-256-GCM, מפתח ב-env).
- אימות חתימת webhook חובה.
- Rate-limit על `/api/leads` (מניעת ספאם) + honeypot field.
- כל ה-routes של ה-dashboard מאחורי auth.

## 13. שלבי בנייה (Phases) — לביצוע לפי הסדר

**Phase 1 — שלד:** Next.js + Drizzle + Neon, סכמה, auth, מבנה מסכים ריק, vercel.json.
**Phase 2 — חיבור Meta:** OAuth flow, שמירת token מוצפן, מסך Settings מציג חשבון מחובר. Mock mode ל-dev (דגל `META_MOCK=true` שמחזיר נתונים מדומים — קריטי לפיתוח לפני App Review).
**Phase 3 — פרסום ידני + Scheduler:** יצירת פוסט ידנית, תור, calendar, cron publish.
**Phase 4 — אנליטיקות:** משיכת insights, post_metrics, מסך Insights עם גרפים.
**Phase 5 — פרזנטור + Content Agent:** onboarding תמונות, ImageProvider, יצירת פוסטים אוטומטית ל-Queue.
**Phase 6 — Comment-to-DM:** webhook, private replies, dm_events, DM Classifier.
**Phase 7 — דף נחיתה + CRM:** /lp/[utm], leads, ייחוס לפוסט.
**Phase 8 — Optimizer + דוחות:** המלצות שעות/ממומן/קהלים, Reporter, יצירת קהלים ב-Marketing API.

## 14. הערות ל-Claude Code

- עברית/RTL בכל ה-UI; `dir="rtl"` גלובלי.
- TypeScript strict, zod לוולידציה של כל קלט חיצוני (webhooks, leads, פלט סוכנים).
- כל קריאה ל-Claude API: temperature נמוך לסוכני אנליטיקה, גבוה יותר ל-Content Agent; פלט JSON בלבד עם פירסור עמיד.
- אל תפרסם לאינסטגרם בפועל כשהדגל META_MOCK פעיל.
- כתוב seed script עם נתוני דמו כדי שכל המסכים ייראו חיים מהיום הראשון.
