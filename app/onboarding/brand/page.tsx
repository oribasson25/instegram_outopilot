import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BrandOnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>DNA המותג</CardTitle>
          <CardDescription>
            שלב 3 מתוך 3 — שאלון קצר שממנו הסוכנים ייצרו תוכן
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>תחום העסק</Label>
            <Input placeholder="למשל: קליניקת קוסמטיקה" disabled />
          </div>
          <div className="space-y-1.5">
            <Label>קהל יעד</Label>
            <Input placeholder="למשל: נשים 25–45 באזור המרכז" disabled />
          </div>
          <div className="space-y-1.5">
            <Label>טון דיבור</Label>
            <Input placeholder="למשל: חם, מקצועי, עם הומור עדין" disabled />
          </div>
          <div className="space-y-1.5">
            <Label>מה מוכרים (ההצעה)</Label>
            <Textarea placeholder="תיאור ההצעה המרכזית" disabled />
          </div>
          <Button disabled className="w-full">
            שמירה (תופעל בהמשך Phase 1-2 עם חיבור ה-DB)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
