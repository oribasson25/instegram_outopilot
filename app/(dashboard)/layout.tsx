import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Rocket,
} from "lucide-react";

const nav = [
  { href: "/", label: "דשבורד", icon: LayoutDashboard },
  { href: "/queue", label: "תור תוכן", icon: ListTodo },
  { href: "/calendar", label: "לוח פרסום", icon: CalendarDays },
  { href: "/leads", label: "לידים", icon: Users },
  { href: "/insights", label: "תובנות", icon: BarChart3 },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-l bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b">
          <Rocket className="size-6 text-primary" />
          <span className="text-lg font-bold">InstaPilot</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-muted-foreground">
          מערכת אוטונומית לאינסטגרם
        </div>
      </aside>
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  );
}
