import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PresenterOnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>הגדרת פרזנטור</CardTitle>
          <CardDescription>
            שלב 2 מתוך 3 — העלאת 5–20 תמונות ייחוס ואימון מודל זהות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
            אזור העלאת תמונות — ייבנה ב-Phase 5 (Vercel Blob + ImageProvider)
          </div>
          <Button disabled className="w-full">
            התחל אימון (יופעל ב-Phase 5)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
