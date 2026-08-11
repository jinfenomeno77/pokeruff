import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { BlindLevel } from "@/data/staticData";
import { supabase } from "@/integrations/supabase/client";

function playBlindChangeSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Play two ascending tones
    [0, 0.15].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 587 : 880; // D5 then A5
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    });
  } catch (_) {
    // Audio not available
  }
}

interface SyncConfig {
  tournamentId: string;
  timerRunning: boolean;
  currentBlindIndex: number;
  timerSecondsLeft: number;
  timerUpdatedAt: string;
}

interface BlindTimerProps {
  blinds: BlindLevel[];
  initialLevelIndex?: number;
  isAdmin?: boolean;
  sync?: SyncConfig;
}

export default function BlindTimer({ blinds, initialLevelIndex = 0, isAdmin = false, sync }: BlindTimerProps) {
  const [currentIndex, setCurrentIndex] = useState(sync?.currentBlindIndex ?? initialLevelIndex);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (sync) {
      return computeTimeLeft(sync);
    }
    return blinds[initialLevelIndex].duration * 60;
  });
  const [running, setRunning] = useState(sync?.timerRunning ?? false);
  const lastSyncRef = useRef(sync);

  // Compute time left from sync data
  function computeTimeLeft(s: SyncConfig): number {
    if (!s.timerRunning) return s.timerSecondsLeft;
    const elapsed = Math.floor((Date.now() - new Date(s.timerUpdatedAt).getTime()) / 1000);
    return Math.max(0, s.timerSecondsLeft - elapsed);
  }

  // Subscribe to realtime changes when sync is provided
  useEffect(() => {
    if (!sync) return;

    const channel = supabase
      .channel(`timer-${sync.tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${sync.tournamentId}`,
        },
        (payload: any) => {
          const row = payload.new;
          const newSync: SyncConfig = {
            tournamentId: row.id,
            timerRunning: row.timer_running ?? false,
            currentBlindIndex: row.current_blind_index ?? 0,
            timerSecondsLeft: row.timer_seconds_left ?? 0,
            timerUpdatedAt: row.timer_updated_at ?? new Date().toISOString(),
          };
          // Play sound if blind level changed
          const prevIndex = lastSyncRef.current?.currentBlindIndex;
          lastSyncRef.current = newSync;
          if (newSync.currentBlindIndex !== prevIndex) {
            playBlindChangeSound();
          }
          setCurrentIndex(newSync.currentBlindIndex);
          setRunning(newSync.timerRunning);
          setTimeLeft(computeTimeLeft(newSync));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sync?.tournamentId]);

  // Apply initial sync and subsequent sync prop changes (non-realtime)
  useEffect(() => {
    if (!sync) return;
    lastSyncRef.current = sync;
    setCurrentIndex(sync.currentBlindIndex);
    setRunning(sync.timerRunning);
    setTimeLeft(computeTimeLeft(sync));
  }, [sync?.timerRunning, sync?.currentBlindIndex, sync?.timerSecondsLeft, sync?.timerUpdatedAt]);

  const current = blinds[currentIndex] ?? blinds[0];
  const next = currentIndex < blinds.length - 1 ? blinds[currentIndex + 1] : null;

  const totalSeconds = current.duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Local countdown tick
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance to next level
          if (currentIndex < blinds.length - 1) {
            const newIdx = currentIndex + 1;
            const newSeconds = blinds[newIdx].duration * 60;
            // If admin + sync, persist the level change
            if (isAdmin && sync) {
              persistTimerState(sync.tournamentId, true, newIdx, newSeconds);
            }
            playBlindChangeSound();
            setCurrentIndex(newIdx);
            return newSeconds;
          }
          setRunning(false);
          if (isAdmin && sync) {
            persistTimerState(sync.tournamentId, false, currentIndex, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, currentIndex, blinds, isAdmin, sync?.tournamentId]);

  async function persistTimerState(
    tournamentId: string,
    timerRunning: boolean,
    blindIndex: number,
    secondsLeft: number
  ) {
    await supabase.from("tournaments").update({
      timer_running: timerRunning,
      current_blind_index: blindIndex,
      timer_seconds_left: secondsLeft,
      timer_updated_at: new Date().toISOString(),
    } as any).eq("id", tournamentId);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    const newRunning = !running;
    setRunning(newRunning);
    if (sync) {
      persistTimerState(sync.tournamentId, newRunning, currentIndex, timeLeft);
    }
  }, [running, currentIndex, timeLeft, sync]);

  const goNext = useCallback(() => {
    if (currentIndex < blinds.length - 1) {
      const newIdx = currentIndex + 1;
      const newSeconds = blinds[newIdx].duration * 60;
      setCurrentIndex(newIdx);
      setTimeLeft(newSeconds);
      if (sync) {
        persistTimerState(sync.tournamentId, running, newIdx, newSeconds);
      }
    }
  }, [currentIndex, blinds, running, sync]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIdx = currentIndex - 1;
      const newSeconds = blinds[newIdx].duration * 60;
      setCurrentIndex(newIdx);
      setTimeLeft(newSeconds);
      if (sync) {
        persistTimerState(sync.tournamentId, running, newIdx, newSeconds);
      }
    }
  }, [currentIndex, blinds, running, sync]);

  const reset = useCallback(() => {
    const newSeconds = current.duration * 60;
    setTimeLeft(newSeconds);
    setRunning(false);
    if (sync) {
      persistTimerState(sync.tournamentId, false, currentIndex, newSeconds);
    }
  }, [current, currentIndex, sync]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6 card-glow">
      <div className="text-center mb-4">
        {current.isBreak ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">♠ Intervalo</p>
            <p className="font-display text-3xl font-bold uppercase text-gold">PAUSA</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Nível {current.level}
            </p>
            <p className="font-data text-4xl md:text-5xl font-bold text-foreground">
              {current.smallBlind.toLocaleString()} / {current.bigBlind.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              current.isBreak ? "bg-gold" : timeLeft < 60 ? "bg-ember animate-pulse-glow" : "bg-crimson"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className={`text-center font-data text-5xl md:text-6xl font-bold tracking-tight mt-4 ${
            timeLeft < 60 ? "text-ember" : "text-foreground"
          }`}
          aria-label={`Tempo restante: ${Math.floor(timeLeft / 60)} minutos e ${timeLeft % 60} segundos`}
        >
          {formatTime(timeLeft)}
        </p>
      </div>

      {next && (
        <div className="text-center mb-4 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Próximo:{" "}
            {next.isBreak ? (
              <span className="text-gold font-semibold">Intervalo</span>
            ) : (
              <span className="font-data font-semibold text-foreground">
                {next.smallBlind.toLocaleString()} / {next.bigBlind.toLocaleString()}
              </span>
            )}
          </p>
        </div>
      )}


      {isAdmin && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={goPrev} className="rounded-lg bg-secondary p-3 text-foreground hover:bg-secondary/80 transition-colors">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={handlePlayPause}
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
