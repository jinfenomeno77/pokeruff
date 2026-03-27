import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Play, Check, Plus, Trophy, MoreVertical, Shield, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { blindStructure } from "@/data/staticData";
import BlindTimer from "@/components/BlindTimer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Tab = "tournaments" | "users";
type NewTournamentType = "future" | "past";

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
  current_blind_index: number | null;
  timer_running: boolean | null;
  num_tables: number | null;
}

interface Registration {
  id: string;
  user_id: string;
  status: string;
  position: number | null;
  profiles: { first_name: string; last_name: string; email: string } | null;
}

interface UserWithRole {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  tournaments_participated: number;
}

interface PastPlayer {
  name: string;
  position: number | null;
  userId: string | null; // null = manual name, not a registered user
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>("tournaments");
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentRow | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [userTournaments, setUserTournaments] = useState<string[]>([]);

  // New tournament form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTournamentType, setNewTournamentType] = useState<NewTournamentType>("future");
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("16:00");
  const [newLocation, setNewLocation] = useState("");
  const [newMaxPlayers, setNewMaxPlayers] = useState("18");
  const [newNumTables, setNewNumTables] = useState("1");
  const [newPrizePool, setNewPrizePool] = useState("");
  const [pastPlayers, setPastPlayers] = useState<PastPlayer[]>([]);
  const [pastPlayerName, setPastPlayerName] = useState("");
  const [pastPlayerPosition, setPastPlayerPosition] = useState("");
  const [pastPlayerUserId, setPastPlayerUserId] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Timer state
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTournaments();
      loadUsers();
    }
  }, [isAdmin]);

  async function loadTournaments() {
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("date", { ascending: false });
    if (data) setTournaments(data as TournamentRow[]);
  }

  async function loadUsers() {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    const { data: regs } = await supabase.from("tournament_registrations").select("user_id, tournament_id");

    if (profiles) {
      const usersWithRoles: UserWithRole[] = profiles.map((p: any) => {
        const userRole = roles?.find((r: any) => r.user_id === p.id);
        const tournamentsCount = regs?.filter((r: any) => r.user_id === p.id).length ?? 0;
        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          role: userRole?.role ?? "user",
          tournaments_participated: tournamentsCount,
        };
      });
      setUsers(usersWithRoles);
    }
  }

  async function openTournament(t: TournamentRow) {
    setSelectedTournament(t);
    setEditName(t.name);
    setEditDate(t.date);
    setEditTime(t.time?.slice(0, 5) ?? "16:00");
    setEditStatus(t.status);
    setEditLocation(t.location ?? "");
    setTimerStarted(t.status === "in-progress");

    const { data } = await supabase
      .from("tournament_registrations")
      .select("id, user_id, status, position, profiles(first_name, last_name, email)")
      .eq("tournament_id", t.id);
    setRegistrations((data as unknown as Registration[]) ?? []);
  }

  async function saveTournament() {
    if (!selectedTournament) return;
    await supabase.from("tournaments").update({
      name: editName,
      date: editDate,
      time: editTime,
      status: editStatus as any,
      location: editLocation || null,
    }).eq("id", selectedTournament.id);
    toast.success("Torneio atualizado!");
    loadTournaments();
    setSelectedTournament(null);
  }

  async function addTournament() {
    if (!newName || !newDate) return;

    if (newTournamentType === "past") {
      // Create finished tournament
      const { data: tournament, error } = await supabase.from("tournaments").insert({
        name: newName,
        date: newDate,
        time: newTime,
        location: newLocation || null,
        max_players: parseInt(newMaxPlayers) || 18,
        status: "finished" as any,
        prize_pool: newPrizePool ? parseFloat(newPrizePool) : null,
        total_players: pastPlayers.length || null,
      }).select().single();

      if (error || !tournament) {
        toast.error("Erro ao criar torneio.");
        return;
      }

      // Add registered users as participants
      for (const player of pastPlayers) {
        if (player.userId) {
          await supabase.from("tournament_registrations").insert({
            tournament_id: tournament.id,
            user_id: player.userId,
            status: "confirmed" as any,
            position: player.position,
          });
        }
        // Manual names (non-registered) can't be added to tournament_registrations
        // since it requires a user_id. They are tracked only visually via total_players.
      }

      toast.success("Torneio passado criado!");
    } else {
      // Create future tournament
      await supabase.from("tournaments").insert({
        name: newName,
        date: newDate,
        time: newTime,
        location: newLocation || null,
        max_players: parseInt(newMaxPlayers) || 18,
        num_tables: parseInt(newNumTables) || 1,
      });
      toast.success("Torneio criado!");
    }

    resetNewForm();
    loadTournaments();
  }

  function resetNewForm() {
    setShowNewForm(false);
    setNewTournamentType("future");
    setNewName("");
    setNewDate("");
    setNewTime("16:00");
    setNewLocation("");
    setNewMaxPlayers("18");
    setNewNumTables("1");
    setNewPrizePool("");
    setPastPlayers([]);
    setPastPlayerName("");
    setPastPlayerPosition("");
    setPastPlayerUserId("");
  }

  function addPastPlayer() {
    if (!pastPlayerName.trim()) return;
    setPastPlayers([
      ...pastPlayers,
      {
        name: pastPlayerName.trim(),
        position: pastPlayerPosition ? parseInt(pastPlayerPosition) : null,
        userId: pastPlayerUserId || null,
      },
    ]);
    setPastPlayerName("");
    setPastPlayerPosition("");
    setPastPlayerUserId("");
  }

  function removePastPlayer(index: number) {
    setPastPlayers(pastPlayers.filter((_, i) => i !== index));
  }

  async function approveRegistration(regId: string) {
    await supabase.from("tournament_registrations").update({ status: "confirmed" }).eq("id", regId);
    toast.success("Inscrição aprovada!");
    if (selectedTournament) openTournament(selectedTournament);
  }

  async function rejectRegistration(regId: string) {
    await supabase.from("tournament_registrations").delete().eq("id", regId);
    toast.success("Inscrição recusada.");
    if (selectedTournament) openTournament(selectedTournament);
  }

  async function startTournament() {
    if (!selectedTournament) return;
    await supabase.from("tournaments").update({
      status: "in-progress",
      timer_running: true,
      current_blind_index: 0,
    }).eq("id", selectedTournament.id);
    setEditStatus("in-progress");
    setTimerStarted(true);
    loadTournaments();
  }

  async function toggleAdmin(userId: string, currentRole: string) {
    if (currentRole === "admin") {
      await supabase.from("user_roles").update({ role: "user" }).eq("user_id", userId);
    } else {
      await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
    }
    loadUsers();
  }

  async function openUserDetails(u: UserWithRole) {
    setSelectedUser(u);
    const { data } = await supabase
      .from("tournament_registrations")
      .select("tournament_id, tournaments(name)")
      .eq("user_id", u.id);
    setUserTournaments(data?.map((d: any) => d.tournaments?.name ?? "—") ?? []);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground mb-4">Faça login para acessar o painel admin.</p>
          <a href="/login" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Entrar</a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Sem Permissão</h1>
          <p className="text-sm text-muted-foreground">Você não tem permissão de administrador.</p>
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
            {tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => openTournament(t)}
                className={`rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors ${
                  t.status !== "finished" ? "border-accent/30 border-2" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-sm font-semibold text-foreground">{t.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    t.status === "finished" ? "bg-muted text-muted-foreground" :
                    t.status === "in-progress" ? "bg-destructive/15 text-destructive" :
                    "bg-accent/15 text-accent"
                  }`}>
                    {t.status === "finished" ? "Finalizado" : t.status === "in-progress" ? "Em Andamento" : "Próximo"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                  <span>R${t.buy_in}</span>
                </div>
              </div>
            ))}

            {/* Add tournament */}
            {!showNewForm ? (
              <div
                onClick={() => setShowNewForm(true)}
                className="rounded-xl border-2 border-dashed border-border bg-card/50 p-6 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Adicionar torneio</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-display text-base font-semibold text-foreground">Novo Torneio</h3>

                {/* Tournament type selector */}
                <div className="flex gap-1 rounded-lg bg-secondary p-1">
                  <button
                    onClick={() => setNewTournamentType("future")}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      newTournamentType === "future"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Futuro
                  </button>
                  <button
                    onClick={() => setNewTournamentType("past")}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      newTournamentType === "past"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Já aconteceu
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="PokerUFF 4ª ed." className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
                    <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Local</label>
                  <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Opcional" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Máx. Jogadores</label>
                  <input type="number" value={newMaxPlayers} onChange={(e) => setNewMaxPlayers(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Future-only: number of tables */}
                {newTournamentType === "future" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantidade de Mesas</label>
                    <input type="number" value={newNumTables} onChange={(e) => setNewNumTables(e.target.value)} min="1" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {/* Past-only: prize pool and players */}
                {newTournamentType === "past" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Prize Pool (R$)</label>
                      <input type="number" value={newPrizePool} onChange={(e) => setNewPrizePool(e.target.value)} placeholder="Ex: 480" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>

                    {/* Add players */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Jogadores</label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={pastPlayerName}
                            onChange={(e) => setPastPlayerName(e.target.value)}
                            placeholder="Nome do jogador"
                            className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <input
                            type="number"
                            value={pastPlayerPosition}
                            onChange={(e) => setPastPlayerPosition(e.target.value)}
                            placeholder="Pos."
                            className="w-16 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            onClick={addPastPlayer}
                            className="rounded-lg bg-primary/15 px-3 py-2 text-primary hover:bg-primary/25 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Link to registered user (optional) */}
                        <div>
                          <select
                            value={pastPlayerUserId}
                            onChange={(e) => {
                              setPastPlayerUserId(e.target.value);
                              if (e.target.value) {
                                const u = users.find((u) => u.id === e.target.value);
                                if (u && !pastPlayerName) {
                                  setPastPlayerName(`${u.first_name} ${u.last_name}`);
                                }
                              }
                            }}
                            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Vincular a usuário cadastrado (opcional)</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.first_name} {u.last_name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Player list */}
                        {pastPlayers.length > 0 && (
                          <div className="rounded-lg border border-border divide-y divide-border max-h-32 overflow-y-auto">
                            {pastPlayers.map((p, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-1.5">
                                <span className="text-xs text-foreground">
                                  {p.position ? `${p.position}º - ` : ""}{p.name}
                                  {p.userId && <span className="text-muted-foreground"> (cadastrado)</span>}
                                </span>
                                <button onClick={() => removePastPlayer(i)} className="text-destructive hover:text-destructive/80">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button onClick={addTournament} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Criar</button>
                  <button onClick={resetNewForm} className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors">Cancelar</button>
                </div>
              </div>
            )}
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
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.first_name} {u.last_name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                    <button
                      onClick={() => openUserDetails(u)}
                      className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive/25 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum usuário cadastrado</p>
                )}
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
                <DialogTitle className="font-display text-xl text-foreground">Editar Torneio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
                      <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring [color-scheme:dark]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Local</label>
                    <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="pre-inscription">Pré-inscrição</option>
                      <option value="confirming">Confirmando</option>
                      <option value="in-progress">Em andamento</option>
                      <option value="finished">Finalizado</option>
                    </select>
                  </div>
                </div>

                <button onClick={saveTournament} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Salvar Alterações
                </button>

                {/* Players */}
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                    Inscritos ({registrations.length})
                  </h3>
                  <div className="rounded-lg border border-border divide-y divide-border max-h-40 overflow-y-auto">
                    {registrations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-3">Nenhum inscrito</p>
                    )}
                    {registrations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                            {(r.profiles?.first_name?.[0] ?? "") + (r.profiles?.last_name?.[0] ?? "")}
                          </div>
                          <span className="text-sm text-foreground">
                            {r.profiles ? `${r.profiles.first_name} ${r.profiles.last_name}` : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => approveRegistration(r.id)}
                                className="rounded-md bg-primary/15 p-1 text-primary hover:bg-primary/25"
                                title="Aprovar"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => rejectRegistration(r.id)}
                                className="rounded-md bg-destructive/15 p-1 text-destructive hover:bg-destructive/25"
                                title="Recusar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            r.status === "confirmed"
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning"
                          }`}>
                            {r.status === "confirmed" ? "✓" : "⏳"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer control */}
                {editStatus !== "finished" && (
                  <div className="space-y-3">
                    {!timerStarted ? (
                      <button
                        onClick={startTournament}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Iniciar Torneio
                      </button>
                    ) : (
                      <BlindTimer
                        blinds={blindStructure}
                        initialLevelIndex={selectedTournament.current_blind_index ?? 0}
                        isAdmin={true}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-sm">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-foreground">Detalhes do Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-semibold text-foreground">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="text-sm font-semibold text-foreground">{selectedUser.email ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Torneios</p>
                    {userTournaments.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userTournaments.map((name, i) => (
                          <span key={i} className="rounded-full bg-card px-2 py-0.5 text-xs text-foreground border border-border">{name}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum torneio</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleAdmin(selectedUser.id, selectedUser.role);
                    setSelectedUser({ ...selectedUser, role: selectedUser.role === "admin" ? "user" : "admin" });
                  }}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    selectedUser.role === "admin"
                      ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                      : "bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {selectedUser.role === "admin" ? "Remover Admin" : "Tornar Administrador"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
