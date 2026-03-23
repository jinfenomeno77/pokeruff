import { useState } from "react";
import { motion } from "framer-motion";
import BlindTimer from "@/components/BlindTimer";
import { liveTournament } from "@/data/fakeData";

export default function LiveTournament() {
  const [showStackInput, setShowStackInput] = useState(false);
  const [myStack, setMyStack] = useState("");
  const activePlayers = liveTournament.players
    .filter(p => p.status !== "eliminado")
    .sort((a, b) => b.stack - a.stack);
  const eliminatedPlayers = liveTournament.players.filter(p => p.status === "eliminado");
  const totalChips = activePlayers.reduce((sum, p) => sum + p.stack, 0);
  const avgStack = activePlayers.length > 0 ? Math.round(totalChips / activePlayers.length) : 0;

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-widest text-destructive">Ao Vivo</p>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            {liveTournament.name}
          </h1>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <BlindTimer
            blinds={liveTournament.blindStructure}
            initialLevelIndex={liveTournament.currentBlindIndex}
          />
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Jogadores</p>
            <p className="font-display text-lg font-bold text-foreground">
              {activePlayers.length}/{liveTournament.players.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Fichas totais</p>
            <p className="font-display text-lg font-bold text-foreground">{totalChips.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Média</p>
            <p className="font-display text-lg font-bold text-foreground">{avgStack.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Stack input (interval simulation) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Atualizar meu stack</p>
            <span className="text-xs text-warning font-medium">⏸ Intervalo ativo</span>
          </div>
          {!showStackInput ? (
            <button
              onClick={() => setShowStackInput(true)}
              className="w-full rounded-lg bg-primary/15 border border-primary/30 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/25 transition-colors"
            >
              Informar stack atual
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                value={myStack}
                onChange={(e) => setMyStack(e.target.value)}
                placeholder="Ex: 12500"
                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => setShowStackInput(false)}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Enviar
              </button>
            </div>
          )}
        </motion.div>

        {/* Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card overflow-hidden mb-6"
        >
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-display text-base font-semibold text-foreground">Ranking ao Vivo</h2>
          </div>
          <div className="divide-y divide-border">
            {activePlayers.map((player, i) => (
              <div key={player.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`font-display text-sm font-bold w-6 text-center ${
                    i === 0 ? "text-accent" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-warning/70" : "text-muted-foreground"
                  }`}>
                    {i + 1}º
                  </span>
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {player.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{player.name}</p>
                    {player.status === "reentrada" && (
                      <span className="text-[10px] text-warning font-medium">Reentrada</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-foreground">{player.stack.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {player.stack > avgStack ? "↑" : "↓"} {Math.round((player.stack / avgStack) * 100)}% da média
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Eliminated */}
          {eliminatedPlayers.length > 0 && (
            <div className="border-t border-border px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Eliminados</p>
              {eliminatedPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1 opacity-50">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                    {p.avatar}
                  </div>
                  <span className="text-xs text-muted-foreground line-through">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tables */}
        {liveTournament.tables && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Mesas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveTournament.tables.map((table) => (
                <div key={table.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-display text-sm font-semibold text-foreground mb-2">{table.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {table.playerIds.map((pid) => {
                      const player = liveTournament.players.find(p => p.id === pid);
                      return player ? (
                        <span key={pid} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                          {player.name.split(" ")[0]}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
