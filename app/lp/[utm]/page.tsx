import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// דף נחיתה ציבורי — התוכן ייגזר מ-brand_profile + הפוסט המשויך ל-UTM ב-Phase 7
export default async function LandingPage({
  params,
}: {
  params: Promise<{ utm: string }>;
}) {
  const { utm } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight">
            רוצים לשמוע עוד? השאירו פרטים
          </h1>
          <p className="text-muted-foreground">
            התוכן בדף הזה יותאם אוטומטית לפוסט שממנו הגעתם (Phase 7)
          </p>
        </div>

        <form className="space-y-4 text-right rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="name">שם מלא</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">טלפון</Label>
            <Input id="phone" name="phone" type="tel" required dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">אימייל (אופציונלי)</Label>
            <Input id="email" name="email" type="email" dir="ltr" />
          </div>
          {/* honeypot נגד ספאם */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <input type="hidden" name="utm" value={utm} />
          <Button type="submit" className="w-full" size="lg" disabled>
            שלחו לי פרטים (יופעל ב-Phase 7)
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">קוד הפניה: {utm}</p>
      </div>
    </div>
  );
}
