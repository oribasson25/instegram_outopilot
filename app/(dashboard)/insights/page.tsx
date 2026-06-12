import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">תובנות</h1>
        <p className="text-muted-foreground">
          אנליטיקות, דפוסים מנצחים והמלצות המערכת
        </p>
      </div>
      <Tabs defaultValue="analytics" dir="rtl">
        <TabsList>
          <TabsTrigger value="analytics">אנליטיקות</TabsTrigger>
          <TabsTrigger value="recommendations">המלצות</TabsTrigger>
          <TabsTrigger value="reports">דוחות</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">אין נתונים עדיין</CardTitle>
              <CardDescription>
                גרפים של engagement לפי pillar, שעה ויום יופיעו לאחר איסוף
                אנליטיקות (Phase 4).
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">אין המלצות</CardTitle>
              <CardDescription>
                המלצות על שעות פרסום, קידום ממומן וקהלים יופיעו כאן (Phase 8).
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">אין דוחות</CardTitle>
              <CardDescription>הדוח השבועי הראשון ייווצר ב-Phase 8.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
