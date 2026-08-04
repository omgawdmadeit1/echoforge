import { Camera, Map, Plus, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEchoStore } from "@/lib/echoforge/store";
import type { AppMode } from "@/lib/echoforge/types";

const items: { mode: AppMode; label: string; icon: typeof Camera }[] = [
  { mode: "ar", label: "Walk", icon: Camera },
  { mode: "map", label: "Map", icon: Map },
  { mode: "create", label: "Leave", icon: Plus },
  { mode: "profile", label: "You", icon: UserRound },
];

export function BottomNav() {
  const mode = useEchoStore((s) => s.mode);
  const setMode = useEchoStore((s) => s.setMode);
  const serendipity = useEchoStore((s) => s.serendipity);

  return (
    <nav className="safe-pb pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pt-2">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-[var(--radius-2xl)] border border-border bg-bg-panel/90 p-1.5 backdrop-blur-xl panel-shadow">
        {items.map(({ mode: m, label, icon: Icon }) => {
          const active = mode === m;
          const isCreate = m === "create";
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xl)] text-[10px] font-medium tracking-wide transition-colors",
                active && !isCreate && "bg-bg-subtle text-cyan",
                !active && !isCreate && "text-fg-subtle hover:text-fg-muted",
                isCreate &&
                  "bg-cyan text-bg shadow-[0_0_18px_color-mix(in_oklab,var(--color-cyan)_30%,transparent)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("size-4", isCreate && "size-5")} strokeWidth={2} />
              <span className={cn(isCreate && "font-semibold")}>{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => serendipity()}
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius-xl)] text-amber hover:bg-bg-subtle"
          title="Serendipity"
          aria-label="Serendipity — random nearby echo"
        >
          <Sparkles className="size-4" />
        </button>
      </div>
    </nav>
  );
}
