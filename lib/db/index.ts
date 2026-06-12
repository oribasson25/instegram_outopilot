import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

// אתחול עצל — החיבור נוצר רק בקריאה הראשונה בפועל, לא בזמן build
let _db: Db | undefined;

export function getDb(): Db {
  _db ??= createDb();
  return _db;
}

// נוח לשאילתות רגילות; למקומות שדורשים instance אמיתי (instanceof) השתמשו ב-getDb()
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop, getDb());
  },
});

export * from "./schema";
