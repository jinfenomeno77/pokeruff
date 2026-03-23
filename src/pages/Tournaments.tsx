import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, DollarSign, ChevronRight, Clock, Timer, MapPin } from "lucide-react";
import { nextTournament, pastTournaments } from "@/data/fakeData";

export default function Tournaments() {
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
          className="rounded-xl border-2 border-accent/30 bg-card p-5 mb-6 gold-glow"
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
            to="/inscription"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
          >
            Inscrever-se
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Player list */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card mb-6 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Inscritos</h2>
            <span className="text-xs text-muted-foreground">{confirmed + waiting} jogadores</span>
          </div>
          <div className="divide-y divide-border">
            {nextTournament.players.map((player) => (
              <div key={player.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {player.avatar}
                  </div>
                  <span className="text-sm font-medium text-foreground">{player.name}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  player.inscriptionStatus === "confirmado"
                    ? "bg-primary/15 text-primary"
                    : "bg-warning/15 text-warning"
                }`}>
                  {player.inscriptionStatus === "confirmado" ? "Confirmado" : "Aguardando"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick tools */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <Link
            to="/live"
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
          >
            <Timer className="h-5 w-5 text-primary" />
            Tournament Timer
          </Link>
          <Link
            to="/structure"
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
          >
            <Clock className="h-5 w-5 text-accent" />
            Blind Structure
          </Link>
        </motion.div>

        {/* Past tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Torneios Anteriores</h2>
          <div className="space-y-3">
            {pastTournaments.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4">
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
                {/* Fake ranking */}
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="text-accent font-semibold">🥇 {t.players[0]?.name}</span>
                  <span className="text-muted-foreground">🥈 {t.players[1]?.name}</span>
                  <span className="text-muted-foreground">🥉 {t.players[2]?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
