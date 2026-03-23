import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Mode = "login" | "register";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="min-h-screen pb-20 md:pb-10 flex items-center justify-center">
      <div className="container max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-8 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">POKERUFF</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            {/* Mode toggle */}
            <div className="flex gap-1 mb-5 rounded-lg bg-secondary p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Cadastrar
              </button>
            </div>

            <div className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
