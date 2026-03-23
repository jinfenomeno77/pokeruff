import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Users, Calendar, Trophy } from "lucide-react";
import { nextTournament } from "@/data/fakeData";

export default function Index() {
  const confirmed = nextTournament.players.filter(p => p.inscriptionStatus === "confirmado").length;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-felt px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background pointer-events-none" />
        <div className="container relative z-10 text-center max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Torneio entre amigos
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-gradient-gold mb-4">
              POKERUFF
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto">
              Torneios presenciais de Texas Hold'em com estrutura profissional, ranking em tempo real e muita diversão.
            </p>

            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-display text-lg font-semibold text-accent-foreground transition-all hover:scale-105 gold-glow"
            >
              Inscrever-se no próximo torneio
              <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Calendar, label: "Próximo", value: new Date(nextTournament.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) },
            { icon: Users, label: "Inscritos", value: `${confirmed}/${nextTournament.maxPlayers}` },
            { icon: Trophy, label: "Buy-in", value: `R$${nextTournament.buyIn}` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center card-glow">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* What is POKERUFF */}
      <section className="container pb-10">
        <div className="rounded-xl border border-border bg-card p-5 md:p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">O que é o POKERUFF?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Somos um grupo de amigos apaixonados por poker. Organizamos torneios presenciais regulares com estrutura profissional, blinds progressivos e ranking entre os participantes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Formato", desc: "Texas Hold'em No-Limit com blinds progressivos" },
              { title: "Frequência", desc: "Torneios quinzenais às sextas-feiras" },
              { title: "Premiação", desc: "Prize pool dividido entre os 3 primeiros" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg bg-secondary p-3">
                <p className="font-display text-sm font-semibold text-accent mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
