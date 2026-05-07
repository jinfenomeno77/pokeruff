import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlindTimer from "@/components/BlindTimer";
import { supabase } from "@/integrations/supabase/client";
import { useBlindStructure } from "@/hooks/useBlindStructure";

interface TournamentRow {
  id: string;
  name: string;
  status: string;
  current_blind_index: number | null;
}

export default function LiveTournament() {
  const [tournament, setTournament] = useState<TournamentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { structure: blindStructure } = useBlindStructure();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "in-progress")
        .limit(1)
        .maybeSingle();
      setTournament(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen pb-20 md:pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-foreground mb-2">Nenhum torneio ao vivo</p>
          <p className="text-sm text-muted-foreground">Aguarde o início do próximo torneio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-widest text-destructive">Ao Vivo</p>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            {tournament.name}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <BlindTimer
            blinds={blindStructure}
            initialLevelIndex={tournament.current_blind_index ?? 0}
          />
        </motion.div>
      </div>
    </div>
  );
}
