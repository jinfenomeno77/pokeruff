import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Trophy, Clock, Shield, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-pokeruff.jpeg";

const navItems = [
  { path: "/", label: "Início", icon: Home },
  { path: "/tournaments", label: "Torneios", icon: Trophy },
  { path: "/structure", label: "Estrutura", icon: Clock },
  { path: "/admin", label: "Admin", icon: Shield },
];

export default function AppHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background px-4 pb-4"
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
