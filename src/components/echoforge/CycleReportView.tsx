import { useEchoStore } from "@/lib/echoforge/store";
import type { CycleReport } from "@/lib/echoforge/types";
import { useEffect } from "react";

export function CycleReportView({ cycle }: { cycle: CycleReport }) {
  const track = useEchoStore((s) => s.track);

  useEffect(() => {
    track("cycle_view", undefined, { cycleId: cycle.id });
  }, [cycle.id, track]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-amber/25 bg-bg/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium tracking-[0.2em] text-amber uppercase">
          Cycle report
        </p>
        <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[11px] text-amber tabular-nums">
          {cycle.confidence}% confidence
        </span>
      </div>
      <h3 className="font-display text-base font-medium text-fg">{cycle.title}</h3>
      {cycle.hypothesis ? (
        <p className="mt-2 text-xs leading-relaxed text-fg-muted">
          <span className="text-fg-subtle">Hypothesis · </span>
          {cycle.hypothesis}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-fg">
        <span className="text-fg-subtle">Outcome · </span>
        {cycle.outcome}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {cycle.metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-[var(--radius-sm)] border border-border bg-bg-subtle/50 px-3 py-2"
          >
            <p className="text-[10px] tracking-wide text-fg-subtle uppercase">
              {m.label}
            </p>
            <p className="mt-0.5 font-display text-lg font-medium text-cyan tabular-nums">
              {m.value}
              {m.unit ? (
                <span className="ml-1 text-xs font-normal text-fg-muted">
                  {m.unit}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
      {cycle.notes ? (
        <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
          {cycle.notes}
        </p>
      ) : null}
    </div>
  );
}
