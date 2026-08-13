import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Users, Calendar, Trophy } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo-pokeruff.png.asset.json";
import heroBgAsset from "@/assets/hero-bg.jpg.asset.json";

const logo = logoAsset.url;
import FlipCountdown from "@/components/FlipCountdown";

interface TournamentRow {
  id: string;
  name: string;
  date: string;
  time: string;
  buy_in: number;
  max_players: number;
  status: string;
}

export default function Index() {
  const [nextTournament, setNextTournament] = useState<TournamentRow | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .neq("status", "finished")
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) {
        setNextTournament(data);
        const { count } = await supabase
          .from("tournament_registrations")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", data.id)
          .eq("status", "confirmed");
        setConfirmedCount(count ?? 0);
      }
      setLoadingStats(false);
    }
    load();
  }, []);

  // Live countdown tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const countdown = useMemo(() => {
    if (!nextTournament) return null;
    if (nextTournament.status === "in-progress" || nextTournament.status === "finished") return null;
    const target = new Date(`${nextTournament.date}T${nextTournament.time}`).getTime();
    const diff = target - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }, [nextTournament, now]);

  const almostFull =
    !!nextTournament && confirmedCount / Math.max(nextTournament.max_players, 1) >= 0.8;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-felt px-4 py-16 md:py-24">
        {/* Foto de fundo à esquerda, mesclada ao fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-[60%] bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${heroBgAsset.url})`,
            maskImage:
              "linear-gradient(to right, hsl(0 0% 0% / 0.9) 0%, hsl(0 0% 0% / 0.5) 45%, transparent 90%)",
            WebkitMaskImage:
              "linear-gradient(to right, hsl(0 0% 0% / 0.9) 0%, hsl(0 0% 0% / 0.5) 45%, transparent 90%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />
        <div className="container relative z-10 text-left max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={logo}
              alt="PokerUFF"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-28 w-28 md:h-36 md:w-36 object-contain mb-5"
            />
            {countdown ? (
              <FlipCountdown
                units={[
                  { val: countdown.days, label: "dias" },
                  { val: countdown.hours, label: "h" },
                  { val: countdown.minutes, label: "min" },
                  { val: countdown.seconds, label: "s" },
                ]}
              />
            ) : (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Poker Tournament
              </p>
            )}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Torneios presenciais de Texas Hold'em com estrutura profissional, ranking em tempo real e muita diversão.
            </p>

            <Link
              to="/tournaments"
              className={`group inline-flex items-center gap-2 rounded-lg bg-ember px-6 py-3.5 font-display text-lg font-semibold uppercase tracking-wide text-accent-foreground transition-colors hover:bg-ember/90 ${
                almostFull ? "ring-1 ring-ember/60 animate-pulse-glow" : ""
              }`}
            >
              {almostFull ? "Últimas vagas — inscrever-se" : "Inscrever-se no próximo torneio"}
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
            {
              icon: Calendar,
              label: "Próximo",
              value: nextTournament
                ? new Date(nextTournament.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                : "—",
            },
            {
              icon: Users,
              label: "Inscritos",
              value: nextTournament ? `${confirmedCount}/${nextTournament.max_players}` : "—",
            },
            {
              icon: Trophy,
              label: "Buy-in",
              value: nextTournament ? `R$${nextTournament.buy_in}` : "—",
              highlight: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-4 text-center ${
                stat.highlight ? "border-gold/30 bg-card gold-glow" : "border-border bg-card"
              }`}
            >
              <stat.icon
                className={`h-5 w-5 mx-auto mb-2 ${stat.highlight ? "text-gold" : "text-muted-foreground"}`}
              />
              {loadingStats ? (
                <div className="h-7 w-16 mx-auto rounded bg-muted animate-pulse" />
              ) : (
                <p
                  className={`font-data text-xl font-bold ${
                    stat.highlight ? "text-gold" : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* What is POKERUFF */}
      <section className="container pb-10">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">O que é o POKERUFF?</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xl">
          Torneios presenciais de Texas Hold'em organizados por um grupo de amigos, com estrutura
          profissional. Se você nunca jogou torneio, comece por aqui.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              suit: "♠",
              title: "O que é reentrada?",
              desc: "Se você perder todas as fichas antes do fim do registro tardio, pode voltar ao jogo pagando a taxa de reentrada e recebendo um novo stack.",
            },
            {
              suit: "♥",
              title: "Como funciona o registro tardio?",
              desc: "Dá para entrar no torneio já em andamento até um nível de blind definido na estrutura. Depois disso, as inscrições fecham de vez.",
            },
            {
              suit: "♣",
              title: "Como o ranking é calculado?",
              desc: "A posição final de cada torneio vale pontos. O ranking acumula esses pontos ao longo da temporada.",
            },
            {
              suit: "♦",
              title: "Como é a premiação?",
              desc: "O prize pool é formado por buy-ins e reentradas, e dividido entre os primeiros colocados da mesa final.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-4 card-lift">
              <div className="flex items-center gap-2 mb-1.5">
                <span aria-hidden className="text-crimson text-lg leading-none">
                  {item.suit}
                </span>
                <p className="font-display text-sm font-semibold text-foreground">{item.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
