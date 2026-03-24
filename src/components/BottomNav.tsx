import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Clock, Shield } from "lucide-react";

const items = [
  { path: "/", label: "Início", icon: Home },
  { path: "/tournaments", label: "Torneios", icon: Trophy },
  { path: "/structure", label: "Estrutura", icon: Clock },
  { path: "/admin", label: "Admin", icon: Shield },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
