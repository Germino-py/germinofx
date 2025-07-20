import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calculator,
  BookOpen,
  BarChart3,
  Calendar,
  LogOut,
  TrendingUp,
  User,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SessionTimerSidebar } from "@/components/trading/SessionTimerSidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Calculateur", url: "/tradecopilot/", icon: Calculator },
  { title: "Journal", url: "/tradecopilot/journal", icon: BookOpen },
  { title: "Analytics", url: "/tradecopilot/analytics", icon: BarChart3 },
  { title: "Calendrier", url: "/tradecopilot/calendar", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border flex flex-col p-0">
        <div>
          <div className={cn("flex items-center gap-3 p-4", isCollapsed ? "justify-center" : "")}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">TradeCopilot</h2>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-1 px-2 mt-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/tradecopilot/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-lg text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "h-10 w-10 justify-center" : "px-3 py-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-300"></span>
                    )}
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4">
            <SessionTimerSidebar />
          </div>
        </div>

        <div className="mt-auto p-2">
          <Separator className="my-2 bg-sidebar-border/50" />
            <a href="/" className={cn("flex items-center gap-3 rounded-lg text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", isCollapsed ? "h-10 w-10 justify-center" : "px-3 py-2")}>
                <Home className="w-5 h-5" />
                {!isCollapsed && <span>Accueil</span>}
            </a>
            <div className={cn("flex items-center gap-3 p-2", isCollapsed ? "justify-center" : "")}>
                <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <User className="w-5 h-5 text-sidebar-foreground" />
                </div>
                {!isCollapsed && (
                    <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name || "Trader"}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || "trader@example.com"}</p>
                    </div>
                )}
            </div>
             <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                onClick={handleLogout}
                className="w-full justify-center gap-3 text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive"
             >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && "Déconnexion"}
            </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}