import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, Coffee, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { BlindLevel } from "@/data/staticData";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  configId: string | null;
  initialStructure: BlindLevel[];
  initialLateRegistrationEndIndex: number;
}

type Row = BlindLevel & { _key: string };

function withKeys(arr: BlindLevel[]): Row[] {
  return arr.map((b, i) => ({ ...b, _key: `${i}-${Math.random().toString(36).slice(2, 7)}` }));
}

export default function BlindStructureEditor({
  open,
  onOpenChange,
  configId,
  initialStructure,
  initialLateRegistrationEndIndex,
}: Props) {
  const [rows, setRows] = useState<Row[]>(withKeys(initialStructure));
  const [lateIdx, setLateIdx] = useState<number>(initialLateRegistrationEndIndex);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRows(withKeys(initialStructure));
      setLateIdx(initialLateRegistrationEndIndex);
    }
  }, [open, initialStructure, initialLateRegistrationEndIndex]);

  function updateRow(idx: number, patch: Partial<BlindLevel>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addLevel(after: number) {
    const newRow: Row = {
      _key: Math.random().toString(36).slice(2),
      level: 0,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15,
    };
    setRows((prev) => {
      const next = [...prev];
      next.splice(after + 1, 0, newRow);
      return next;
    });
    if (after < lateIdx) setLateIdx((i) => i + 1);
  }

  function addBreak(after: number) {
    const newRow: Row = {
      _key: Math.random().toString(36).slice(2),
      level: 0,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 10,
      isBreak: true,
    };
    setRows((prev) => {
      const next = [...prev];
      next.splice(after + 1, 0, newRow);
      return next;
    });
    if (after < lateIdx) setLateIdx((i) => i + 1);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    if (idx < lateIdx) setLateIdx((i) => Math.max(0, i - 1));
  }

  function move(idx: number, delta: number) {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    setRows((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    // Strip keys
    const cleaned: BlindLevel[] = rows.map((r) => ({
      level: r.isBreak ? 0 : Number(r.level) || 0,
      smallBlind: r.isBreak ? 0 : Number(r.smallBlind) || 0,
      bigBlind: r.isBreak ? 0 : Number(r.bigBlind) || 0,
      ante: r.isBreak ? 0 : Number(r.ante) || 0,
      duration: Number(r.duration) || 0,
      ...(r.isBreak ? { isBreak: true } : {}),
    }));

    const payload = {
      structure: cleaned as any,
      late_registration_end_index: Math.min(Math.max(lateIdx, 0), cleaned.length),
      updated_at: new Date().toISOString(),
    };

    let error;
    if (configId) {
      ({ error } = await supabase
        .from("blind_structure_config" as any)
        .update(payload as any)
        .eq("id", configId));
    } else {
      ({ error } = await supabase.from("blind_structure_config" as any).insert(payload as any));
    }
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar estrutura: " + error.message);
      return;
    }
    toast.success("Estrutura atualizada! O timer ao vivo já reflete as mudanças.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Editar Estrutura de Blinds</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg bg-secondary p-3">
            <Label className="text-xs text-muted-foreground">Fim do Registro Tardio (índice da linha)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={rows.length}
                value={lateIdx}
                onChange={(e) => setLateIdx(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                A faixa de "fim do registro tardio" será exibida antes da linha de índice {lateIdx}.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div
                key={r._key}
                className={`rounded-lg border p-3 ${r.isBreak ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground w-8">#{idx}</span>
                  {r.isBreak ? (
                    <span className="text-xs font-semibold uppercase tracking-widest text-warning flex items-center gap-1">
                      <Coffee className="h-3.5 w-3.5" /> Intervalo
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                      Nível
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground"
                      title="Mover para cima"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground"
                      title="Mover para baixo"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1.5 rounded hover:bg-destructive/15 text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {r.isBreak ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Duração (min)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={r.duration}
                        onChange={(e) => updateRow(idx, { duration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div>
                      <Label className="text-xs">Nível</Label>
                      <Input
                        type="number"
                        value={r.level}
                        onChange={(e) => updateRow(idx, { level: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Small Blind</Label>
                      <Input
                        type="number"
                        value={r.smallBlind}
                        onChange={(e) => updateRow(idx, { smallBlind: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Big Blind</Label>
                      <Input
                        type="number"
                        value={r.bigBlind}
                        onChange={(e) => updateRow(idx, { bigBlind: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ante</Label>
                      <Input
                        type="number"
                        value={r.ante}
                        onChange={(e) => updateRow(idx, { ante: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Duração (min)</Label>
                      <Input
                        type="number"
                        value={r.duration}
                        onChange={(e) => updateRow(idx, { duration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => addLevel(idx)}>
                    <Plus className="h-3.5 w-3.5" /> Nível abaixo
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addBreak(idx)}>
                    <Coffee className="h-3.5 w-3.5" /> Intervalo abaixo
                  </Button>
                </div>
              </div>
            ))}

            {rows.length === 0 && (
              <Button type="button" variant="outline" onClick={() => addLevel(-1)}>
                <Plus className="h-4 w-4" /> Adicionar primeiro nível
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border sticky bottom-0 bg-background">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
