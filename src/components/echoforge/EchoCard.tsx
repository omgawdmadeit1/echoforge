import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistance, distanceMeters } from "@/lib/echoforge/geo";
import { MOOD_LABELS } from "@/lib/echoforge/seed";
import { useEchoStore } from "@/lib/echoforge/store";
import type { Echo } from "@/lib/echoforge/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CycleReportView } from "./CycleReportView";

export function EchoCard({ echo, compact }: { echo: Echo; compact?: boolean }) {
  const position = useEchoStore((s) => s.position);
  const user = useEchoStore((s) => s.user);
  const setActiveEcho = useEchoStore((s) => s.setActiveEcho);
  const discoverEcho = useEchoStore((s) => s.discoverEcho);
  const saveEcho = useEchoStore((s) => s.saveEcho);
  const unsaveEcho = useEchoStore((s) => s.unsaveEcho);
  const track = useEchoStore((s) => s.track);
  const deleteOwnEcho = useEchoStore((s) => s.deleteOwnEcho);

  const dist = distanceMeters(position, { lat: echo.lat, lng: echo.lng });
  const saved = user.savedEchoIds.includes(echo.id);
  const own = user.createdEchoIds.includes(echo.id);

  const share = async () => {
    track("share", echo.id);
    const snippet = (echo.text ?? "An echo").slice(0, 120);
    const shareText = `EchoForge — ${snippet}\nSomeone left something here.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "EchoForge", text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      /* user cancelled */
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => discoverEcho(echo.id)}
        className="hologram-border w-full rounded-[var(--radius-lg)] p-3 text-left transition-colors hover:border-cyan/50"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm leading-snug text-fg">{echo.text}</p>
          <span className="shrink-0 text-[10px] text-cyan tabular-nums">
            {formatDistance(dist)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-fg-subtle">
          <span>{echo.placeLabel ?? "Somewhere"}</span>
          <span>·</span>
          <span>{echo.creatorName}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="animate-fade-up hologram-border panel-shadow relative mx-auto w-full max-w-md overflow-hidden rounded-[var(--radius-xl)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan/8 via-transparent to-amber/5" />
      <div className="relative p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-cyan uppercase">
              Someone left something here
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-fg-muted">
              <MapPin className="size-3.5 text-amber" />
              <span>{echo.placeLabel ?? "Unknown place"}</span>
              <span className="text-fg-subtle">·</span>
              <span className="tabular-nums">{formatDistance(dist)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveEcho(null)}
            className="rounded-[var(--radius-sm)] p-2 text-fg-muted hover:bg-bg-subtle hover:text-fg"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="font-display text-xl leading-snug font-medium tracking-tight text-fg whitespace-pre-wrap">
          {echo.text}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {echo.moodTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-bg-subtle/80 px-2.5 py-0.5 text-[11px] text-fg-muted"
            >
              {MOOD_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-fg-subtle">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                echo.displayMode === "verified" ? "bg-cyan" : "bg-fg-subtle",
              )}
            />
            <span>{echo.creatorName}</span>
            <span>·</span>
            <span>{formatRelativeTime(echo.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-amber">
            <Sparkles className="size-3" />
            <span className="tabular-nums">{echo.qualityScore.toFixed(1)}</span>
          </div>
        </div>

        {echo.cycle ? (
          <div className="mt-5">
            <CycleReportView cycle={echo.cycle} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => (saved ? unsaveEcho(echo.id) : saveEcho(echo.id))}
          >
            {saved ? (
              <BookmarkCheck className="size-3.5" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={share}>
            <Share2 className="size-3.5" />
            Share
          </Button>
          {own ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => deleteOwnEcho(echo.id)}
            >
              Remove
            </Button>
          ) : null}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-fg-subtle">
          Discovered {(echo.discoveredCount ?? 0).toLocaleString()} times. Your
          turn — leave something true.
        </p>
      </div>
    </div>
  );
}
