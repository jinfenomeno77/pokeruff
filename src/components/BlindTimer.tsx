import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { BlindLevel } from "@/data/fakeData";

interface BlindTimerProps {
  blinds: BlindLevel[];
  initialLevelIndex?: number;
  isAdmin?: boolean;
}

export default function BlindTimer({ blinds, initialLevelIndex = 0, isAdmin = false }: BlindTimerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialLevelIndex);
  const [timeLeft, setTimeLeft] = useState(blinds[initialLevelIndex].duration * 60);
  const [running, setRunning] = useState(false);

  const current = blinds[currentIndex];
  const next = currentIndex < blinds.length - 1 ? blinds[currentIndex + 1] : null;

  const totalSeconds = current.duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentIndex < blinds.length - 1) {
            setCurrentIndex((i) => i + 1);
            return blinds[currentIndex + 1].duration * 60;
          }
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, currentIndex, blinds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const goNext = useCallback(() => {
    if (currentIndex < blinds.length - 1) {
      const newIdx = currentIndex + 1;
      setCurrentIndex(newIdx);
      setTimeLeft(blinds[newIdx].duration * 60);
    }
  }, [currentIndex, blinds]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIdx = currentIndex - 1;
      setCurrentIndex(newIdx);
      setTimeLeft(blinds[newIdx].duration * 60);
    }
  }, [currentIndex, blinds]);

  const reset = useCallback(() => {
    setTimeLeft(current.duration * 60);
    setRunning(false);
  }, [current]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6">
      {/* Current blind info */}
      <div className="text-center mb-4">
        {current.isBreak ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-warning mb-1">☕ Intervalo</p>
            <p className="font-display text-3xl font-bold text-warning">PAUSA</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Nível {current.level}
            </p>
            <p className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {current.smallBlind.toLocaleString()} / {current.bigBlind.toLocaleString()}
            </p>
            {current.ante > 0 && (
              <p className="text-sm text-muted-foreground mt-1">Ante: {current.ante.toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="relative mb-4">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              current.isBreak ? "bg-warning" : timeLeft < 60 ? "bg-destructive animate-pulse-glow" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`text-center font-display text-5xl md:text-6xl font-bold mt-4 ${
          timeLeft < 60 ? "text-destructive" : "text-foreground"
        }`}>
          {formatTime(timeLeft)}
        </p>
      </div>

      {/* Next blind preview */}
      {next && (
        <div className="text-center mb-4 rounded-lg bg-secondary/50 py-2 px-3">
          <p className="text-xs text-muted-foreground">
            Próximo:{" "}
            {next.isBreak ? (
              <span className="text-warning font-semibold">Intervalo</span>
            ) : (
              <span className="text-foreground font-semibold">
                {next.smallBlind.toLocaleString()} / {next.bigBlind.toLocaleString()}
                {next.ante > 0 && ` (ante ${next.ante})`}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={goPrev} className="rounded-lg bg-secondary p-3 text-foreground hover:bg-secondary/80 transition-colors">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => setRunning(!running)}
            className={`rounded-lg p-4 text-primary-foreground transition-colors ${
              running ? "bg-warning hover:bg-warning/90" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button onClick={goNext} className="rounded-lg bg-secondary p-3 text-foreground hover:bg-secondary/80 transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
          <button onClick={reset} className="rounded-lg bg-secondary p-3 text-muted-foreground hover:bg-secondary/80 transition-colors">
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
