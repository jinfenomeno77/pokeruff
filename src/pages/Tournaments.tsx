import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, DollarSign, ChevronRight, MapPin, Copy, Check } from "lucide-react";
import BlindTimer from "@/components/BlindTimer";
import { blindStructure } from "@/data/staticData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchTournamentRegistrations,
  getRegistrationInitials,
  getRegistrationName,
  type TournamentRegistration,
} from "@/lib/tournamentRegistrations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PIX_KEY = "b9441eea-07bb-408d-aa56-666bc02d94a4";

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
  num_tables: number | null;
}

type InscriptionStep = "confirm" | "payment" | "done";

export default function Tournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentRow | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscriptionStep, setInscriptionStep] = useState<InscriptionStep | null>(null);
  const [userRegistration, setUserRegistration] = useState<TournamentRegistration | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("date", { ascending: false });
    if (data) setTournaments(data as TournamentRow[]);
    setLoading(false);
  }

  async function openTournament(t: TournamentRow) {
    setSelectedTournament(t);
    setInscriptionStep(null);
    setCopied(false);
    const regs = await fetchTournamentRegistrations(t.id);
    setRegistrations(regs);

    if (user) {
      const myReg = regs.find((r) => r.user_id === user.id);
      setUserRegistration(myReg ?? null);
    } else {
      setUserRegistration(null);
    }
  }

  async function handleRegister() {
    if (!user || !selectedTournament) return;

    const { data: existingRegistration, error: existingError } = await supabase
      .from("tournament_registrations")
      .select("id, status")
      .eq("tournament_id", selectedTournament.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      toast.error("Não foi possível verificar sua inscrição.");
      return;
    }

    if (existingRegistration) {
      toast.info(
        existingRegistration.status === "confirmed"
          ? "Você já está confirmado neste torneio."
          : "Você já está inscrito e aguarda aprovação.",
      );
      await openTournament(selectedTournament);
      return;
    }

    const { error } = await supabase.from("tournament_registrations").insert({
      tournament_id: selectedTournament.id,
      user_id: user.id,
      status: "pending" as any,
    });
    if (error) {
      toast.error(error.message || "Erro ao se inscrever. Tente novamente.");
      return;
    }
    setInscriptionStep("done");
    await openTournament(selectedTournament);
  }

  function copyPix() {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 3000);
  }

  function getPlayerDisplayName(r: TournamentRegistration): string {
    return getRegistrationName(r);
  }

  function getPlayerInitials(r: TournamentRegistration): string {
    return getRegistrationInitials(r);
  }

  const upcoming = tournaments.filter((t) => t.status !== "finished");
  const past = tournaments.filter((t) => t.status === "finished");
  const nextTournament = upcoming[0];
  const isFinished = selectedTournament?.status === "finished";

  // For past tournaments show all registrations; for upcoming show only confirmed
  const visibleRegistrations = isFinished
    ? registrations
    : registrations.filter((r) => r.status === "confirmed");

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
                <span>
                  {new Date(nextTournament.date + "T12:00:00").toLocaleDateString("pt-BR")} •{" "}
                  {nextTournament.time?.slice(0, 5)}
                </span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  openTournament(nextTournament);
                }}
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
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Torneios Anteriores
            </h2>
            <div className="space-y-3">
              {past.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTournament(t)}
                  className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {t.name}
                    </h3>
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
                <DialogTitle className="font-display text-xl text-foreground">
                  {selectedTournament.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {new Date(selectedTournament.date + "T12:00:00").toLocaleDateString("pt-BR")}{" "}
                      • {selectedTournament.time?.slice(0, 5)}
                    </span>
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

                {!isFinished && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Reentrada</p>
                      <p className="text-sm font-semibold text-foreground">
                        R${selectedTournament.reentry_fee} (
                        {selectedTournament.reentry_stack.toLocaleString()} fichas)
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Registro Tardio</p>
                      <p className="text-sm font-semibold text-foreground">Até nível 5</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Stack Inicial</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedTournament.initial_stack.toLocaleString()} fichas
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Vagas</p>
                      <p className="text-sm font-semibold text-foreground">
                        {visibleRegistrations.length}/{selectedTournament.max_players}
                      </p>
                    </div>
                  </div>
                )}

                {/* Registrations / Rankings */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                    {isFinished
                      ? "Ranking"
                      : `Inscritos Confirmados (${visibleRegistrations.length})`}
                  </h3>
                  <div className="rounded-lg border border-border divide-y divide-border max-h-48 overflow-y-auto">
                    {visibleRegistrations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {isFinished ? "Nenhum participante" : "Nenhum inscrito confirmado ainda"}
                      </p>
                    )}
                    {(isFinished
                      ? [...visibleRegistrations].sort(
                          (a, b) => (a.position ?? 99) - (b.position ?? 99)
                        )
                      : visibleRegistrations
                    ).map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          {isFinished && r.position && (
                            <span className="text-lg">
                              {r.position === 1
                                ? "🥇"
                                : r.position === 2
                                ? "🥈"
                                : r.position === 3
                                ? "🥉"
                                : `${r.position}º`}
                            </span>
                          )}
                          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                            {getPlayerInitials(r)}
                          </div>
                          <span className="text-sm text-foreground">
                            {getPlayerDisplayName(r)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inscription flow */}
                {!isFinished && user && !userRegistration && !inscriptionStep && (
                  <button
                    onClick={() => setInscriptionStep("confirm")}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
                  >
                    Inscrever-se
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {/* Already registered message */}
                {!isFinished && user && userRegistration && !inscriptionStep && (
                  <div className="rounded-lg bg-secondary p-4 text-center">
                    <p className="text-sm font-semibold text-foreground">Você já está inscrito!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status:{" "}
                      <span
                        className={
                          userRegistration.status === "confirmed"
                            ? "text-primary font-semibold"
                            : "text-yellow-500 font-semibold"
                        }
                      >
                        {userRegistration.status === "confirmed"
                          ? "Confirmado"
                          : "Aguardando aprovação"}
                      </span>
                    </p>
                  </div>
                )}

                {/* Step: Confirm inscription */}
                {inscriptionStep === "confirm" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card p-5 space-y-4"
                  >
                    <h3 className="font-display text-base font-semibold text-foreground">
                      Pagamento via PIX
                    </h3>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Valor do Buy-in</p>
                      <p className="font-display text-3xl font-bold text-gradient-gold mb-4">
                        R$35,00
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-xs text-muted-foreground mb-1">Chave PIX (Aleatória)</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground flex-1 break-all">
                          {PIX_KEY}
                        </p>
                        <button
                          onClick={copyPix}
                          className="shrink-0 rounded-md bg-primary/15 p-2 text-primary hover:bg-primary/25 transition-colors"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Envie o comprovante para o organizador do torneio.
                    </p>
                    <button
                      onClick={() => {
                        setInscriptionStep("payment");
                        handleRegister();
                      }}
                      className="w-full rounded-lg bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02]"
                    >
                      Já efetuei o pagamento
                    </button>
                  </motion.div>
                )}

                {/* Step: Done */}
                {(inscriptionStep === "payment" || inscriptionStep === "done") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-border bg-card p-5 text-center"
                  >
                    <Check className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Inscrição Realizada!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Status:{" "}
                        <span className="font-semibold text-accent">Aguardando aprovação</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Você será notificado assim que o organizador confirmar seu pagamento.
                    </p>
                  </motion.div>
                )}

                {!isFinished && !user && (
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
