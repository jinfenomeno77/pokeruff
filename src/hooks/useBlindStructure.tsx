import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blindStructure as defaultStructure, LATE_REGISTRATION_END_INDEX as defaultLateIdx, type BlindLevel } from "@/data/staticData";

export interface BlindStructureConfig {
  id: string | null;
  structure: BlindLevel[];
  lateRegistrationEndIndex: number;
  loading: boolean;
}

export function useBlindStructure(): BlindStructureConfig {
  const [config, setConfig] = useState<BlindStructureConfig>({
    id: null,
    structure: [],
    lateRegistrationEndIndex: defaultLateIdx,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from("blind_structure_config" as any)
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setConfig({
          id: (data as any).id,
          structure: (data as any).structure as BlindLevel[],
          lateRegistrationEndIndex: (data as any).late_registration_end_index ?? defaultLateIdx,
          loading: false,
        });
      } else {
        // Nenhuma configuração no banco: aplica o default apenas agora
        setConfig({
          id: null,
          structure: defaultStructure,
          lateRegistrationEndIndex: defaultLateIdx,
          loading: false,
        });
      }
    }
    load();

    const channel = supabase
      .channel("blind-structure-config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blind_structure_config" },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (!row) return;
          setConfig({
            id: row.id,
            structure: row.structure as BlindLevel[],
            lateRegistrationEndIndex: row.late_registration_end_index ?? defaultLateIdx,
            loading: false,
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return config;
}
