import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">לוח פרסום</h1>
        <p className="text-muted-foreground">
          תצוגה שבועית של פוסטים מתוזמנים ושעות זהב
        </p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <Card key={day} className="min-h-48">
            <CardHeader className="p-3">
              <CardTitle className="text-sm text-center">{day}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">אין פוסטים מתוזמנים</CardTitle>
          <CardDescription>
            שיבוץ פוסטים, drag&drop ותגיות &quot;שעת זהב&quot; יתווספו ב-Phase 3-4.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
