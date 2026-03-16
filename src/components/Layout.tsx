import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Terminal, LayoutGrid, Columns3, AlertTriangle, Clock, Activity, Eye, Settings, ListChecks, Wrench } from "lucide-react";

const nav = [
  { label: "Command",    to: "/",          icon: Terminal },
  { label: "Attention",  to: "/command/resolution", icon: ListChecks },
  { label: "Workbench",  to: "/workbench",  icon: Wrench },
  { label: "Floor",      to: "/floor",     icon: LayoutGrid },
  { label: "Ops",        to: "/ops",       icon: Columns3 },
  { label: "Incidents",  to: "/incidents", icon: AlertTriangle },
  { label: "Schedule",   to: "/schedule",  icon: Clock },
  { label: "Timeline",   to: "/timeline",  icon: Activity },
  { label: "Watchtower", to: "/watchtower", icon: Eye },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">Command</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map(({ label, to, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <div className="mt-3 flex items-center gap-2 px-3">
            <span className="h-2 w-2 rounded-full bg-success animate-status-pulse" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
