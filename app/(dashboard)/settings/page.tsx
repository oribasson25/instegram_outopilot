import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="text-muted-foreground">חשבון, פרזנטור, DNA מותג ומצב אוטונומיה</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">חיבור Meta</CardTitle>
          <CardDescription>חשבון אינסטגרם עסקי מחובר דרך Facebook Login</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant="outline">לא מחובר</Badge>
          <Button asChild>
            <Link href="/onboarding/connect">חיבור חשבון</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">פרזנטור</CardTitle>
          <CardDescription>תמונות ייחוס ומודל זהות ליצירת תמונות עקביות</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant="outline">לא הוגדר</Badge>
          <Button variant="secondary" asChild>
            <Link href="/onboarding/presenter">הגדרת פרזנטור</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">DNA המותג</CardTitle>
          <CardDescription>תחום, קהל, טון דיבור, הצעה ועמודי תוכן</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant="outline">לא הוגדר</Badge>
          <Button variant="secondary" asChild>
            <Link href="/onboarding/brand">מילוי שאלון</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">מצב אוטונומיה</CardTitle>
          <CardDescription>
            approval — כל פוסט ממתין לאישור · full_auto — פרסום אוטומטי מלא
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>approval (ברירת מחדל)</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
