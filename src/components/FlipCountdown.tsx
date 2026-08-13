import { AnimatePresence, motion } from "framer-motion";

function FlipDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-11 w-8 md:h-14 md:w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
      <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-background/80" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="font-data text-xl md:text-2xl font-bold text-foreground"
          style={{ transformOrigin: "50% 50%", backfaceVisibility: "hidden" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function FlipCountdown({
  units,
}: {
  units: { val: number; label: string }[];
}) {
  return (
    <div className="mb-4 flex items-end justify-center gap-2 md:gap-3" style={{ perspective: 400 }}>
      {units.map((u, i) => {
        const digits = u.val.toString().padStart(2, "0").split("");
        return (
          <div key={u.label} className="flex items-end gap-2 md:gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                {digits.map((d, idx) => (
                  <FlipDigit key={idx} value={d} />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="pb-6 font-data text-lg text-muted-foreground/50">:</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
