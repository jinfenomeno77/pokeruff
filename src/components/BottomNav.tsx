import { Link } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        {[
          { path: "/", label: "Início", emoji: "🏠" },
          { path: "/tournaments", label: "Torneios", emoji: "🏆" },
          { path: "/structure", label: "Regras", emoji: "📋" },
          { path: "/live", label: "Ao Vivo", emoji: "🔴" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
