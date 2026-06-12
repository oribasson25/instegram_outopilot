import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">לידים</h1>
        <p className="text-muted-foreground">
          CRM פנימי — לידים מדפי נחיתה, DM והזנה ידנית
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">מקור</TableHead>
                <TableHead className="text-right">פוסט מקור</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">ניקוד</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  אין לידים עדיין — לידים ייכנסו אוטומטית מדף הנחיתה (Phase 7)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
