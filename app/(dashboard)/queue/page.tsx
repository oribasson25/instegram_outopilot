import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">תור תוכן</h1>
        <p className="text-muted-foreground">
          פוסטים שממתינים לאישור, עריכה או דחייה
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>התור ריק</CardTitle>
          <CardDescription>
            ה-Content Agent ייצר כאן טיוטות פוסטים אוטומטית (Phase 5). בשלב 3 יתווסף
            גם יצירת פוסט ידנית.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
