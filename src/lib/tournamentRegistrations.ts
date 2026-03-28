import { supabase } from "@/integrations/supabase/client";

export interface RegistrationProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export interface TournamentRegistration {
  id: string;
  user_id: string | null;
  status: string;
  position: number | null;
  player_name: string | null;
  table_number: number | null;
  profile: RegistrationProfile | null;
}

export async function fetchTournamentRegistrations(
  tournamentId: string,
): Promise<TournamentRegistration[]> {
  const { data: registrations, error } = await supabase
    .from("tournament_registrations")
    .select("id, user_id, status, position, player_name, created_at")
    .eq("tournament_id", tournamentId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const userIds = [...new Set(
    (registrations ?? [])
      .map((registration) => registration.user_id)
      .filter((id): id is string => Boolean(id)),
  )];

  const profilesById = new Map<string, RegistrationProfile>();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    for (const profile of profiles ?? []) {
      profilesById.set(profile.id, profile);
    }
  }

  return (registrations ?? []).map(({ created_at: _createdAt, ...registration }) => ({
    ...registration,
    profile: registration.user_id ? profilesById.get(registration.user_id) ?? null : null,
  }));
}

export function getRegistrationName(registration: TournamentRegistration) {
  if (registration.player_name?.trim()) return registration.player_name.trim();

  if (registration.profile) {
    const fullName = `${registration.profile.first_name} ${registration.profile.last_name}`.trim();
    if (fullName) return fullName;
  }

  return "Jogador sem nome";
}

export function getRegistrationInitials(registration: TournamentRegistration) {
  const source = getRegistrationName(registration);

  return (
    source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}