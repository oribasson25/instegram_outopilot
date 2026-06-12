import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  numeric,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---------- חיבור חשבון אינסטגרם ----------
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  igUserId: text("ig_user_id").notNull(),
  fbPageId: text("fb_page_id").notNull(),
  accessToken: text("access_token").notNull(), // מוצפן AES-256-GCM
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  username: text("username"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow(),
});

// ---------- DNA של המותג ----------
export const brandProfile = pgTable("brand_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  businessField: text("business_field"),
  audience: text("audience"),
  tone: text("tone"),
  offer: text("offer"),
  defaultCta: text("default_cta"),
  language: text("language").default("he"),
  contentPillars: jsonb("content_pillars").$type<string[]>(),
  autonomyMode: text("autonomy_mode").default("approval"), // approval | full_auto
});

// ---------- פרזנטור ----------
export const presenter = pgTable("presenter", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  name: text("name"),
  referenceImages: jsonb("reference_images").$type<string[]>(),
  identityModelId: text("identity_model_id"),
  trainingStatus: text("training_status").default("pending"), // pending|training|ready|failed
});

// ---------- פוסטים ----------
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  status: text("status").default("draft"), // draft|approved|scheduled|published|failed|rejected
  contentPillar: text("content_pillar"),
  hook: text("hook"),
  caption: text("caption"),
  hashtags: text("hashtags").array(),
  imageUrl: text("image_url"),
  imagePrompt: text("image_prompt"),
  dmKeyword: text("dm_keyword"),
  dmMessage: text("dm_message"),
  utmCode: text("utm_code").unique(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  igMediaId: text("ig_media_id"),
  createdBy: text("created_by").default("agent"),
  generationReasoning: text("generation_reasoning"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- אנליטיקות פוסט (snapshot יומי) ----------
export const postMetrics = pgTable("post_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow(),
  impressions: integer("impressions"),
  reach: integer("reach"),
  likes: integer("likes"),
  comments: integer("comments"),
  saves: integer("saves"),
  shares: integer("shares"),
  profileVisits: integer("profile_visits"),
  follows: integer("follows"),
  videoViews: integer("video_views"),
  leadsAttributed: integer("leads_attributed").default(0),
});

// ---------- מטריקות חשבון יומיות ----------
export const accountMetrics = pgTable("account_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  date: date("date"),
  followers: integer("followers"),
  reach: integer("reach"),
  profileViews: integer("profile_views"),
  websiteClicks: integer("website_clicks"),
});

// ---------- לידים (CRM) ----------
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  source: text("source"), // landing_page | dm | manual
  sourcePostId: uuid("source_post_id").references(() => posts.id),
  utmCode: text("utm_code"),
  status: text("status").default("new"), // new|contacted|qualified|won|lost
  score: integer("score"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- אירועי comment-to-dm ----------
export const dmEvents = pgTable("dm_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id),
  igCommentId: text("ig_comment_id").unique(),
  commenterUsername: text("commenter_username"),
  commentText: text("comment_text"),
  dmSent: boolean("dm_sent").default(false),
  dmSentAt: timestamp("dm_sent_at", { withTimezone: true }),
  error: text("error"),
});

// ---------- המלצות ----------
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  type: text("type"), // schedule_change | content_topic | paid_promotion | audience
  title: text("title"),
  body: text("body"),
  data: jsonb("data"),
  status: text("status").default("pending"), // pending|accepted|dismissed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- שעות זהב ----------
export const optimalSlots = pgTable("optimal_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  dayOfWeek: integer("day_of_week"), // 0-6
  hour: integer("hour"), // 0-23 שעון ישראל
  score: numeric("score"),
  sampleSize: integer("sample_size"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- ריצות סוכנים ----------
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agent: text("agent"), // content|analytics|optimizer|reporter
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status"),
  summary: text("summary"),
  error: text("error"),
});

// ---------- טבלאות NextAuth (magic link) ----------
export const authUsers = pgTable("auth_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
});

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const authVerificationTokens = pgTable(
  "auth_verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);
