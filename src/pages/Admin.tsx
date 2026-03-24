import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Play, Pause, Check, X, Edit, Plus, RotateCcw, Trophy, Calendar, DollarSign, ChevronRight, Shield } from "lucide-react";
import BlindTimer from "@/components/BlindTimer";
import { liveTournament, nextTournament, pastTournaments } from "@/data/fakeData";
import type { Player, Tournament } from "@/data/fakeData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "tournaments" | "users";

// Fake admin credentials
const ADMIN_EMAIL = "admin@pokeruff.com";
const ADMIN_PASS = "admin123";

// Fake users list
const fakeUsers = [
  { id: "u1", name: "Lucas Silva", email: "lucas@email.com", isAdmin: false },
  { id: "u2", name: "Rafael Costa", email: "rafael@email.com", isAdmin: false },
  { id: "u3", name: "Bruno Oliveira", email: "bruno@email.com", isAdmin: false },
  { id: "u4", name: "Pedro Santos", email: "pedro@email.com", isAdmin: false },
  { id: "u5", name: "Thiago Lima", email: "thiago@email.com", isAdmin: false },
  { id: "u6", name: "Chico", email: "chico@email.com", isAdmin: false },
  { id: "u7", name: "Hugo", email: "hugo@email.com", isAdmin: false },
];

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<Tab>("tournaments");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>(nextTournament.players);
  const [users, setUsers] = useState(fakeUsers);
  const [timerActive, setTimerActive] = useState(false);

  const handleLogin = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Credenciais inválidas. Acesso restrito a administradores.");
    }
  };

  const approvePlayer = (id: string) => {
    setPlayers(prev =>
      prev.map(p => p.id === id ? { ...p, inscriptionStatus: "confirmado" as const, status: "confirmado" as const } : p)
    );
  };

  const toggleAdmin = (id: string) => {
    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u)
    );
  };

  const allTournaments = [nextTournament, ...pastTournaments];

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pb-20 md:pb-10 flex items-center justify-center">
        <div className="container max-w-sm">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
              <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">Admin</h1>
              <p className="text-sm text-muted-foreground">
                Acesso restrito a administradores
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pokeruff.com"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {loginError && (
                  <p className="text-xs text-destructive">{loginError}</p>
                )}
                <button
                  onClick={handleLogin}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                >
                  Entrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
            Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground mb-6">Gerencie torneios e usuários.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-lg bg-secondary p-1">
          {([
            { id: "tournaments" as Tab, label: "Torneios", icon: Trophy },
            { id: "users" as Tab, label: "Usuários", icon: Users },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tournaments tab */}
        {tab === "tournaments" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {allTournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className={`rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors ${
                  t.status !== "finished" ? "border-accent/30 border-2" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-sm font-semibold text-foreground">{t.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    t.status === "finished" ? "bg-muted text-muted-foreground" : "bg-accent/15 text-accent"
                  }`}>
                    {t.status === "finished" ? "Finalizado" : "Próximo"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span>{t.players.length} jogadores</span>
                  <span>R${t.buyIn}</span>
                </div>
              </div>
            ))}

            {/* Add tournament */}
            <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-6 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
              <div className="text-center">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Adicionar torneio</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-foreground">Usuários Cadastrados</h2>
                <span className="text-xs text-muted-foreground">{users.length} total</span>
              </div>
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => toggleAdmin(user.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        user.isAdmin
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "Usuário"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tournament Detail Dialog */}
      <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedTournament && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-foreground">{selectedTournament.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                    <input defaultValue={selectedTournament.name} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
                      <input type="date" defaultValue={selectedTournament.date} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
                      <input type="time" defaultValue={selectedTournament.time} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                    <select defaultValue={selectedTournament.status} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="pre-inscription">Pré-inscrição</option>
                      <option value="confirming">Confirmando</option>
                      <option value="in-progress">Em andamento</option>
                      <option value="finished">Finalizado</option>
                    </select>
                  </div>
                </div>

                {/* Players */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                    Jogadores ({selectedTournament.players.length})
                  </h3>
                  <div className="rounded-lg border border-border divide-y divide-border max-h-40 overflow-y-auto">
                    {(selectedTournament.id === nextTournament.id ? players : selectedTournament.players).map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                            {p.avatar}
                          </div>
                          <span className="text-sm text-foreground">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {p.position && (
                            <span className="text-xs text-muted-foreground">{p.position}º</span>
                          )}
                          {p.inscriptionStatus === "aguardando" && selectedTournament.id === nextTournament.id && (
                            <button
                              onClick={() => approvePlayer(p.id)}
                              className="rounded-md bg-primary/15 p-1 text-primary hover:bg-primary/25"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.inscriptionStatus === "confirmado"
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning"
                          }`}>
                            {p.inscriptionStatus === "confirmado" ? "✓" : "⏳"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer control for non-finished tournaments */}
                {selectedTournament.status !== "finished" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {timerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {timerActive ? "Pausar Torneio" : "Iniciar Torneio"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
