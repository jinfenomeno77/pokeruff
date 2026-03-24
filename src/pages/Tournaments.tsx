import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, DollarSign, ChevronRight, MapPin, RotateCcw, Clock, Trophy, X } from "lucide-react";
import { nextTournament, pastTournaments } from "@/data/fakeData";
import type { Tournament } from "@/data/fakeData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Tournaments() {
  const [selectedNext, setSelectedNext] = useState(false);
  const [selectedPast, setSelectedPast] = useState<Tournament | null>(null);

  const confirmed = nextTournament.players.filter(p => p.inscriptionStatus === "confirmado").length;
  const waiting = nextTournament.players.filter(p => p.inscriptionStatus === "aguardando").length;

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 md:py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            Torneios
          </h1>
        </motion.div>

        {/* Next tournament highlight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-accent/30 bg-card p-5 mb-6 gold-glow cursor-pointer"
          onClick={() => setSelectedNext(true)}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            Próximo Torneio
          </p>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">
            {nextTournament.name}
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(nextTournament.date).toLocaleDateString("pt-BR")} • {nextTournament.time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>R${nextTournament.buyIn}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{confirmed}/{nextTournament.maxPlayers}</span>
            </div>
            {nextTournament.location && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{nextTournament.location}</span>
              </div>
            )}
          </div>

          <Link
            to="/login"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
          >
            Inscrever-se
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Past tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Torneios Anteriores</h2>
          <div className="space-y-3">
            {pastTournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedPast(t)}
                className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">{t.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t.players.length} jogadores</span>
                  <span>Buy-in: R${t.buyIn}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
                  {t.players
                    .filter(p => p.position)
                    .sort((a, b) => (a.position || 99) - (b.position || 99))
                    .slice(0, 3)
                    .map((p, i) => (
                      <span key={p.id} className={i === 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {p.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next Tournament Detail Dialog */}
      <Dialog open={selectedNext} onOpenChange={setSelectedNext}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">{nextTournament.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(nextTournament.date).toLocaleDateString("pt-BR")} • {nextTournament.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Buy-in: R${nextTournament.buyIn}</span>
              </div>
              {nextTournament.location && (
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{nextTournament.location}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Reentrada</p>
                <p className="text-sm font-semibold text-foreground">R${nextTournament.reentryFee} ({nextTournament.reentryStack.toLocaleString()} fichas)</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Registro Tardio</p>
                <p className="text-sm font-semibold text-foreground">Até nível 6</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Stack Inicial</p>
                <p className="text-sm font-semibold text-foreground">{nextTournament.initialStack.toLocaleString()} fichas</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Vagas</p>
                <p className="text-sm font-semibold text-foreground">{confirmed}/{nextTournament.maxPlayers}</p>
              </div>
            </div>

            {/* Enrolled players */}
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Inscritos ({confirmed + waiting})</h3>
              <div className="rounded-lg border border-border divide-y divide-border max-h-48 overflow-y-auto">
                {nextTournament.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                        {player.avatar}
                      </div>
                      <span className="text-sm text-foreground">{player.name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      player.inscriptionStatus === "confirmado"
                        ? "bg-primary/15 text-primary"
                        : "bg-warning/15 text-warning"
                    }`}>
                      {player.inscriptionStatus === "confirmado" ? "Confirmado" : "Aguardando"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/login"
              onClick={() => setSelectedNext(false)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
            >
              Inscrever-se
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Past Tournament Detail Dialog */}
      <Dialog open={!!selectedPast} onOpenChange={() => setSelectedPast(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedPast && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-foreground">{selectedPast.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(selectedPast.date).toLocaleDateString("pt-BR")}
                  </div>
                  <span>{selectedPast.players.length} jogadores</span>
                  <span>Buy-in: R${selectedPast.buyIn}</span>
                </div>

                {/* Winners */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">Ranking</h3>
                  <div className="space-y-2">
                    {selectedPast.players
                      .filter(p => p.position)
                      .sort((a, b) => (a.position || 99) - (b.position || 99))
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                            p.position === 1
                              ? "bg-accent/15 border border-accent/30"
                              : p.position === 2
                              ? "bg-secondary border border-border"
                              : p.position === 3
                              ? "bg-secondary border border-border"
                              : "bg-secondary"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {p.position === 1 ? "🥇" : p.position === 2 ? "🥈" : p.position === 3 ? "🥉" : `${p.position}º`}
                            </span>
                            <span className={`text-sm font-medium ${p.position === 1 ? "text-accent" : "text-foreground"}`}>
                              {p.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{p.position}º lugar</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* All participants */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">Participantes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPast.players.map((p) => (
                      <span key={p.id} className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
