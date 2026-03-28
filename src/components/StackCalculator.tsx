import { useState } from "react";
import { Calculator, X, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StackCalculator() {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [subtract, setSubtract] = useState(false);
  const [multiplier, setMultiplier] = useState<number | null>(null);

  const chips = [5, 10, 25, 50, 100, 500, 1000];

  function addChip(value: number) {
    const mult = multiplier ?? 1;
    const delta = subtract ? -(value * mult) : value * mult;
    setHistory((h) => [...h, delta]);
    setTotal((t) => t + delta);
    setMultiplier(null);
  }

  function undo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setTotal((t) => t - last);
  }

  function clear() {
    setTotal(0);
    setHistory([]);
    setMultiplier(null);
    setSubtract(false);
  }

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

          <div className="rounded-lg bg-secondary p-4 text-center mb-2">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {total.toLocaleString("pt-BR")}
            </p>
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
