import { useState, useEffect } from "react";
import { StickyNote, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PlayerNotepadProps {
  tournamentId: string;
  userId: string;
}

function getStorageKey(tournamentId: string, userId: string) {
  return `pokeruff-notes-${tournamentId}-${userId}`;
}

export default function PlayerNotepad({ tournamentId, userId }: PlayerNotepadProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const storageKey = getStorageKey(tournamentId, userId);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setNotes(saved);
  }, [storageKey]);

  function handleChange(value: string) {
    setNotes(value);
    localStorage.setItem(storageKey, value);
  }

  function clearNotes() {
    setNotes("");
    localStorage.removeItem(storageKey);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-40 right-4 md:bottom-[5.5rem] z-40 h-14 w-14 rounded-full bg-secondary text-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform border border-border"
      >
        <StickyNote className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Bloco de Notas</DialogTitle>
          </DialogHeader>

          <Textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Escreva suas anotações aqui..."
            className="min-h-[200px] resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={clearNotes}
              className="text-xs text-destructive hover:underline"
            >
              Limpar anotações
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper to clear notes for a tournament (called when admin changes status)
export function clearTournamentNotes(tournamentId: string) {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith(`pokeruff-notes-${tournamentId}-`)) {
      localStorage.removeItem(key);
    }
  }
}
