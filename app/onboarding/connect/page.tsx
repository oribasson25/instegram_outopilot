import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConnectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>חיבור חשבון Meta</CardTitle>
          <CardDescription>
            שלב 1 מתוך 3 — חיבור חשבון אינסטגרם עסקי דרך Facebook Login for Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            תהליך ה-OAuth המלא ייבנה ב-Phase 2, כולל mock mode לפיתוח לפני App
            Review.
          </p>
          <Button disabled className="w-full">
            התחבר עם Facebook (יופעל ב-Phase 2)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
