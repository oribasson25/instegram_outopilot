import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
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
import { Rocket } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const params = await searchParams;
  const hasResend = !!process.env.AUTH_RESEND_KEY;
  const hasDev = !!process.env.AUTH_DEV_PASSWORD;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Rocket className="size-6" />
          </div>
          <CardTitle>InstaPilot</CardTitle>
          <CardDescription>כניסה למערכת</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {params.verify && (
            <p className="text-sm text-center rounded-md bg-secondary p-3">
              ✉️ נשלח אליך לינק כניסה למייל — בדוק את תיבת הדואר
            </p>
          )}
          {params.error && (
            <p className="text-sm text-center rounded-md bg-destructive/10 text-destructive p-3">
              הכניסה נכשלה — נסה שוב
            </p>
          )}

          {hasResend && (
            <form
              action={async (formData) => {
                "use server";
                await signIn("resend", {
                  email: formData.get("email"),
                  redirectTo: params.callbackUrl || "/",
                });
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full">
                שלח לי לינק כניסה
              </Button>
            </form>
          )}

          {hasDev && (
            <form
              action={async (formData) => {
                "use server";
                await signIn("dev", {
                  password: formData.get("password"),
                  redirectTo: params.callbackUrl || "/",
                });
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="password">סיסמת פיתוח</Label>
                <Input id="password" name="password" type="password" required dir="ltr" />
              </div>
              <Button type="submit" variant="secondary" className="w-full">
                כניסת פיתוח
              </Button>
            </form>
          )}

          {!hasResend && !hasDev && (
            <p className="text-sm text-center text-muted-foreground">
              לא הוגדר ספק התחברות. הגדר <code dir="ltr">AUTH_RESEND_KEY</code> (magic
              link) או <code dir="ltr">AUTH_DEV_PASSWORD</code> (פיתוח) ב-
              <code dir="ltr">.env.local</code>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
