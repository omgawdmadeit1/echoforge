import { useMemo } from "react";

export function Particles({ count = 28 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 2 + (i % 4),
        delay: `${(i % 10) * 0.4}s`,
        duration: `${6 + (i % 5)}s`,
        cyan: i % 3 !== 0,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="animate-particle absolute rounded-full opacity-40"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.cyan ? "var(--color-cyan)" : "var(--color-amber)",
            animationDelay: d.delay,
            animationDuration: d.duration,
            boxShadow: d.cyan
              ? "0 0 8px var(--color-cyan)"
              : "0 0 8px var(--color-amber)",
          }}
        />
      ))}
    </div>
  );
}
