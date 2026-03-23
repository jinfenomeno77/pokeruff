import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Play, Pause, Check, X, Edit, Plus, RotateCcw, Shuffle } from "lucide-react";
import BlindTimer from "@/components/BlindTimer";
import { liveTournament, nextTournament } from "@/data/fakeData";
import type { Player } from "@/data/fakeData";

type Tab = "tournament" | "players" | "tables" | "timer";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("tournament");
  const [players, setPlayers] = useState<Player[]>(nextTournament.players);

  const tabs: { id: Tab; label: string }[] = [
    { id: "tournament", label: "Torneio" },
    { id: "players", label: "Jogadores" },
    { id: "tables", label: "Mesas" },
    { id: "timer", label: "Timer" },
  ];

  const approvePlayer = (id: string) => {
    setPlayers(prev =>
      prev.map(p => p.id === id ? { ...p, inscriptionStatus: "confirmado" as const, status: "confirmado" as const } : p)
    );
  };

  const eliminatePlayer = (id: string) => {
    setPlayers(prev =>
      prev.map(p => p.id === id ? { ...p, status: "eliminado" as const, stack: 0 } : p)
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
            Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground mb-6">Gerencie torneios, jogadores e mesas.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-lg bg-secondary p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tournament tab */}
        {tab === "tournament" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Gerenciar Torneio</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do torneio</label>
                  <input defaultValue={nextTournament.name} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
                    <input type="date" defaultValue={nextTournament.date} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Buy-in (R$)</label>
                    <input type="number" defaultValue={nextTournament.buyIn} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Play className="h-4 w-4" />
                    Iniciar Torneio
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/25 transition-colors">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Status do Torneio</h3>
              <div className="flex flex-wrap gap-2">
                {["Pré-inscrição", "Confirmando", "Em andamento", "Finalizado"].map((s) => (
                  <span
                    key={s}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      s === "Pré-inscrição" ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Players tab */}
        {tab === "players" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-foreground">Jogadores</h2>
                <span className="text-xs text-muted-foreground">{players.length} total</span>
              </div>
              <div className="divide-y divide-border">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {player.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{player.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {player.status} • Stack: {player.stack.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {player.inscriptionStatus === "aguardando" && (
                        <button
                          onClick={() => approvePlayer(player.id)}
                          className="rounded-md bg-primary/15 p-1.5 text-primary hover:bg-primary/25 transition-colors"
                          title="Aprovar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {player.status !== "eliminado" && player.inscriptionStatus === "confirmado" && (
                        <button
                          onClick={() => eliminatePlayer(player.id)}
                          className="rounded-md bg-destructive/15 p-1.5 text-destructive hover:bg-destructive/25 transition-colors"
                          title="Eliminar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button className="rounded-md bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tables tab */}
        {tab === "tables" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {liveTournament.tables?.map((table) => (
              <div key={table.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold text-foreground">{table.name}</h3>
                  <span className="text-xs text-muted-foreground">{table.playerIds.length}/{table.seats} assentos</span>
                </div>
                <div className="space-y-1.5">
                  {table.playerIds.map((pid) => {
                    const player = liveTournament.players.find(p => p.id === pid);
                    return player ? (
                      <div key={pid} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                        <span className="text-sm text-foreground">{player.name}</span>
                        <span className="text-xs text-muted-foreground">{player.stack.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <Plus className="h-4 w-4" />
                Nova Mesa
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <Shuffle className="h-4 w-4" />
                Balancear
              </button>
            </div>
          </motion.div>
        )}

        {/* Timer tab */}
        {tab === "timer" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BlindTimer
              blinds={liveTournament.blindStructure}
              initialLevelIndex={0}
              isAdmin={true}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
