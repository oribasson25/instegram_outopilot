import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">דשבורד</h1>
        <p className="text-muted-foreground">מבט-על על הפעילות האוטונומית</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>לידים היום</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            יתעדכן לאחר חיבור Meta
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>לידים השבוע</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            יתעדכן לאחר חיבור Meta
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>הפוסט הבא</CardDescription>
            <CardTitle className="text-lg">אין פוסט מתוזמן</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            התור ריק כרגע
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>סטטוס סוכנים</CardDescription>
            <CardTitle className="text-lg">
              <Badge variant="secondary">טרם רצו</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            הסוכנים יופעלו בשלבים הבאים
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>המלצה חמה</CardTitle>
          <CardDescription>
            ההמלצה המרכזית של המערכת תופיע כאן לאחר שיצטברו נתונים
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
