import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Trophy, Clock, Shield, LogIn } from "lucide-react";
import logo from "@/assets/logo-pokeruff.jpeg";

const navItems = [
  { path: "/", label: "Início", icon: Home },
  { path: "/tournaments", label: "Torneios", icon: Trophy },
  { path: "/structure", label: "Estrutura", icon: Clock },
  { path: "/admin", label: "Admin", icon: Shield },
];

export default function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PokerUFF" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-bold tracking-wider text-gradient-gold">
            POKERUFF
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Login button - always visible */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </Link>
      </div>
    </header>
  );
}
