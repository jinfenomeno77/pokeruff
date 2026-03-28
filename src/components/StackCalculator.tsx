import { useState } from "react";
import { Calculator, X, Undo2, Copy, Check, Divide } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StackCalculatorProps {
  currentBigBlind?: number;
}

export default function StackCalculator({ currentBigBlind }: StackCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [subtract, setSubtract] = useState(false);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [showBB, setShowBB] = useState(false);

  const chips = [5, 10, 25, 50, 100, 500, 1000];

  function addChip(value: number) {
    const mult = multiplier ?? 1;
    const delta = subtract ? -(value * mult) : value * mult;
    setHistory((h) => [...h, delta]);
    setTotal((t) => t + delta);
    setMultiplier(null);
    setShowBB(false);
  }

  function undo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setTotal((t) => t - last);
    setShowBB(false);
  }

  function clear() {
    setTotal(0);
    setHistory([]);
    setMultiplier(null);
    setSubtract(false);
    setShowBB(false);
  }

  function copyTotal() {
    navigator.clipboard.writeText(String(total));
    toast.success("Valor copiado!");
  }

  function divideBB() {
    if (!currentBigBlind || currentBigBlind === 0) {
      toast.error("Nenhum big blind ativo");
      return;
    }
    setShowBB((prev) => !prev);
  }

  const bbValue = currentBigBlind && currentBigBlind > 0 ? (total / currentBigBlind) : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 z-40 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Calculator className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Calculadora de Stack</DialogTitle>
          </DialogHeader>

          <div className="rounded-lg bg-secondary p-4 text-center mb-2 relative">
            {/* Divide by BB button - top left */}
            {currentBigBlind && currentBigBlind > 0 && (
              <button
                onClick={divideBB}
                className={`absolute top-2 left-2 p-1 rounded transition-colors ${
                  showBB ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dividir por Big Blind"
              >
                <Divide className="h-4 w-4" />
              </button>
            )}

            {/* Copy button - top right */}
            <button
              onClick={copyTotal}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              title="Copiar valor"
            >
              <Copy className="h-4 w-4" />
            </button>

            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {total.toLocaleString("pt-BR")}
            </p>
            {showBB && currentBigBlind && currentBigBlind > 0 && (
              <p className="text-sm font-semibold text-primary mt-1">
                {bbValue % 1 === 0 ? bbValue : bbValue.toFixed(1)} BB
              </p>
            )}
          </div>

          {/* Multiplier + Undo + DEL row */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <button
              onClick={() => setMultiplier(multiplier === 5 ? null : 5)}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                multiplier === 5
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              5x
            </button>
            <button
              onClick={() => setMultiplier(multiplier === 10 ? null : 10)}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                multiplier === 10
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              10x
            </button>
            <button
              onClick={undo}
              className="rounded-lg bg-secondary py-2 text-sm font-bold text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={clear}
              className="rounded-lg bg-destructive py-2 text-sm font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              DEL
            </button>
          </div>

          {/* Chip buttons */}
          <div className="grid grid-cols-2 gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => addChip(chip)}
                className="rounded-lg bg-card border border-border py-3 text-sm font-bold text-foreground hover:border-primary/40 transition-colors"
              >
                {subtract ? "−" : "+"}{chip.toLocaleString("pt-BR")}
              </button>
            ))}
            <button
              onClick={() => setSubtract((s) => !s)}
              className={`rounded-lg py-3 text-sm font-bold transition-colors ${
                subtract
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {subtract ? "Modo −" : "Modo +"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
