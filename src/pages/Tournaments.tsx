import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, DollarSign, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TournamentRow {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string | null;
  buy_in: number;
  reentry_fee: number;
  initial_stack: number;
  reentry_stack: number;
  status: string;
  max_players: number;
  total_players: number | null;
  prize_pool: number | null;
}

interface Registration {
  id: string;
  user_id: string;
  status: string;
  position: number | null;
  profiles: { first_name: string; last_name: string } | null;
}

export default function Tournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentRow | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("date", { ascending: false });
    if (data) setTournaments(data);
    setLoading(false);
  }

  async function openTournament(t: TournamentRow) {
    setSelectedTournament(t);
    const { data } = await supabase
      .from("tournament_registrations")
      .select("id, user_id, status, position, profiles(first_name, last_name)")
      .eq("tournament_id", t.id)
      .order("position", { ascending: true, nullsFirst: false });
    setRegistrations((data as unknown as Registration[]) ?? []);
  }

  const upcoming = tournaments.filter(t => t.status !== "finished");
  const past = tournaments.filter(t => t.status === "finished");
  const nextTournament = upcoming[0];

  const confirmedCount = (t: TournamentRow) => {
    if (t === selectedTournament) {
      return registrations.filter(r => r.status === "confirmed").length;
    }
    return 0;
  };

  async function handleRegister() {
    if (!user || !selectedTournament) return;
    await supabase.from("tournament_registrations").insert({
      tournament_id: selectedTournament.id,
      user_id: user.id,
      status: "pending",
    });
    openTournament(selectedTournament);
  }

  const isSelected = selectedTournament?.status === "finished";

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 md:py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            Torneios
          </h1>
        </motion.div>

        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {/* Next tournament highlight */}
        {nextTournament && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-accent/30 bg-card p-5 mb-6 gold-glow cursor-pointer"
            onClick={() => openTournament(nextTournament)}
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
                <span>{new Date(nextTournament.date + "T12:00:00").toLocaleDateString("pt-BR")} • {nextTournament.time?.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>R${nextTournament.buy_in}</span>
              </div>
              {nextTournament.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{nextTournament.location}</span>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={(e) => { e.stopPropagation(); openTournament(nextTournament); }}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
              >
                Ver detalhes
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
              >
                Faça login para se inscrever
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>
        )}

        {/* Past tournaments */}
        {past.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Torneios Anteriores</h2>
            <div className="space-y-3">
              {past.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTournament(t)}
                  className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-sm font-semibold text-foreground">{t.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t.total_players ?? "—"} jogadores</span>
                    <span>Buy-in: R${t.buy_in}</span>
                    {t.prize_pool && <span>Prize pool: R${t.prize_pool}</span>}
                  </div>
                </div>
              ))}
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(selectedTournament.date + "T12:00:00").toLocaleDateString("pt-BR")} • {selectedTournament.time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>Buy-in: R${selectedTournament.buy_in}</span>
                  </div>
                  {selectedTournament.location && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{selectedTournament.location}</span>
                    </div>
                  )}
                  {selectedTournament.prize_pool && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <span>Prize pool: R${selectedTournament.prize_pool}</span>
                    </div>
                  )}
                </div>

                {!isSelected && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Reentrada</p>
                      <p className="text-sm font-semibold text-foreground">R${selectedTournament.reentry_fee} ({selectedTournament.reentry_stack.toLocaleString()} fichas)</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Registro Tardio</p>
                      <p className="text-sm font-semibold text-foreground">Até nível 5</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Stack Inicial</p>
                      <p className="text-sm font-semibold text-foreground">{selectedTournament.initial_stack.toLocaleString()} fichas</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Vagas</p>
                      <p className="text-sm font-semibold text-foreground">{registrations.filter(r => r.status === "confirmed").length}/{selectedTournament.max_players}</p>
                    </div>
                  </div>
                )}

                {/* Registrations / Rankings */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                    {isSelected ? "Ranking" : `Inscritos (${registrations.length})`}
                  </h3>
                  <div className="rounded-lg border border-border divide-y divide-border max-h-48 overflow-y-auto">
                    {registrations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum inscrito ainda</p>
                    )}
                    {(isSelected
                      ? [...registrations].sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
                      : registrations
                    ).map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          {isSelected && r.position && (
                            <span className="text-lg">
                              {r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}º`}
                            </span>
                          )}
                          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                            {(r.profiles?.first_name?.[0] ?? "") + (r.profiles?.last_name?.[0] ?? "")}
                          </div>
                          <span className="text-sm text-foreground">
                            {r.profiles ? `${r.profiles.first_name} ${r.profiles.last_name}` : "—"}
                          </span>
                        </div>
                        {!isSelected && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            r.status === "confirmed"
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning"
                          }`}>
                            {r.status === "confirmed" ? "Confirmado" : "Aguardando"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Register button */}
                {!isSelected && user && (
                  <button
                    onClick={handleRegister}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
                  >
                    Inscrever-se
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                {!isSelected && !user && (
                  <Link
                    to="/login"
                    onClick={() => setSelectedTournament(null)}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
                  >
                    Faça login para se inscrever
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
