import { useMemo, useState } from "react";
import { BarChart3, Mic, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEchoStore } from "@/lib/echoforge/store";
import type { CycleReport, DisplayMode, MoodTag } from "@/lib/echoforge/types";
import { cn, uid } from "@/lib/utils";
import { Particles } from "./Particles";

const MOODS: MoodTag[] = [
  "wonder",
  "confession",
  "tip",
  "history",
  "quiet",
  "hope",
  "warning",
  "poetry",
  "data",
];

export function CreateView() {
  const createEcho = useEchoStore((s) => s.createEcho);
  const setMode = useEchoStore((s) => s.setMode);
  const user = useEchoStore((s) => s.user);

  const [text, setText] = useState("");
  const [tags, setTags] = useState<MoodTag[]>(["quiet"]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(user.displayMode);
  const [placeLabel, setPlaceLabel] = useState("");
  const [withCycle, setWithCycle] = useState(false);
  const [cycleTitle, setCycleTitle] = useState("");
  const [cycleOutcome, setCycleOutcome] = useState("");
  const [cycleMetric, setCycleMetric] = useState("");
  const [recordingHint, setRecordingHint] = useState(false);

  const canSubmit = text.trim().length >= 8;

  const polish = () => {
    const t = text.trim();
    if (!t) return;
    // Light local "AI polish" — trim and gentle formatting, no external API
    const cleaned = t
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?])/g, "$1")
      .trim();
    const capped =
      cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    setText(capped.length > 280 ? capped.slice(0, 280) : capped);
  };

  const toggleTag = (tag: MoodTag) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 3
          ? prev
          : [...prev, tag],
    );
  };

  const cyclePreview: CycleReport | undefined = useMemo(() => {
    if (!withCycle || !cycleTitle.trim() || !cycleOutcome.trim()) return undefined;
    const value = cycleMetric.trim() || "—";
    return {
      id: uid("cycle"),
      title: cycleTitle.trim(),
      outcome: cycleOutcome.trim(),
      confidence: 72,
      metrics: [
        { label: "Primary metric", value },
        { label: "Samples", value: 1 },
      ],
    };
  }, [withCycle, cycleTitle, cycleOutcome, cycleMetric]);

  const submit = () => {
    if (!canSubmit) return;
    createEcho({
      text: text.trim(),
      moodTags: tags.length ? tags : ["quiet"],
      displayMode,
      placeLabel: placeLabel.trim() || "Here",
      contentType: withCycle ? "hybrid" : "text",
      cycle: cyclePreview,
    });
    setText("");
    setPlaceLabel("");
    setWithCycle(false);
    setCycleTitle("");
    setCycleOutcome("");
    setCycleMetric("");
  };

  return (
    <div className="relative h-full overflow-y-auto bg-bg">
      <Particles count={18} />
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-36 pt-6">
        <p className="text-[11px] font-medium tracking-[0.22em] text-cyan uppercase">
          Leave an echo
        </p>
        <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-fg">
          Your turn.
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Keep it short. Keep it true. Someone later will find this exact place.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-fg-subtle">Message</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 320))}
              rows={5}
              placeholder="What should this place remember?"
              className="w-full resize-none rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3 text-sm leading-relaxed text-fg outline-none placeholder:text-fg-subtle focus:border-cyan/50 focus:ring-2 focus:ring-cyan/20"
            />
            <span className="mt-1 block text-right text-[11px] text-fg-subtle tabular-nums">
              {text.length}/320
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={polish}>
              <Type className="size-3.5" />
              Polish
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setRecordingHint(true);
                setText((t) =>
                  t
                    ? t
                    : "I stood here and listened. The city was softer than I expected.",
                );
                window.setTimeout(() => setRecordingHint(false), 1600);
              }}
            >
              <Mic className="size-3.5" />
              {recordingHint ? "Captured" : "Voice draft"}
            </Button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs text-fg-subtle">Place label</span>
            <input
              value={placeLabel}
              onChange={(e) => setPlaceLabel(e.target.value.slice(0, 48))}
              placeholder="e.g. River bridge, North bench"
              className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-cyan/50 focus:ring-2 focus:ring-cyan/20"
            />
          </label>

          <div>
            <p className="mb-2 text-xs text-fg-subtle">Mood tags (up to 3)</p>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => {
                const on = tags.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleTag(m)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
                      on
                        ? "border-cyan/50 bg-cyan/15 text-cyan"
                        : "border-border bg-bg-subtle text-fg-muted hover:text-fg",
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-fg-subtle">Identity</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["anonymous", "Anonymous"],
                  ["pseudonym", "Pseudonym"],
                  ["verified", "Verified"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDisplayMode(value)}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-2 py-2.5 text-xs transition-colors",
                    displayMode === value
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-border bg-bg-subtle text-fg-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hologram-border rounded-[var(--radius-lg)] p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setWithCycle((v) => !v)}
            >
              <span className="flex items-center gap-2 text-sm text-fg">
                <BarChart3 className="size-4 text-amber" />
                Attach a cycle report
              </span>
              <span className="text-xs text-fg-subtle">
                {withCycle ? "On" : "Optional"}
              </span>
            </button>
            {withCycle ? (
              <div className="mt-4 space-y-3">
                <input
                  value={cycleTitle}
                  onChange={(e) => setCycleTitle(e.target.value)}
                  placeholder="What did you measure?"
                  className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm text-fg outline-none focus:border-amber/40"
                />
                <textarea
                  value={cycleOutcome}
                  onChange={(e) => setCycleOutcome(e.target.value)}
                  placeholder="Outcome in one or two sentences"
                  rows={2}
                  className="w-full resize-none rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-amber/40"
                />
                <input
                  value={cycleMetric}
                  onChange={(e) => setCycleMetric(e.target.value)}
                  placeholder="Primary metric (e.g. 18/24 preferred)"
                  className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm text-fg outline-none focus:border-amber/40"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-fg-subtle">
                Numbers stay secondary. Magic first.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={!canSubmit}
              onClick={submit}
            >
              Place echo
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setMode("ar")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
