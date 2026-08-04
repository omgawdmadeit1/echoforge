import { useEffect } from "react";
import { useEchoStore } from "@/lib/echoforge/store";
import { ArView } from "./ArView";
import { BottomNav } from "./BottomNav";
import { CreateView } from "./CreateView";
import { MapView } from "./MapView";
import { Onboarding } from "./Onboarding";
import { ProfileView } from "./ProfileView";

export function AppShell() {
  const mode = useEchoStore((s) => s.mode);
  const onboardingDone = useEchoStore((s) => s.onboardingDone);
  const hydrate = useEchoStore((s) => s.hydrate);
  const ready = useEchoStore((s) => s.ready);
  const setMode = useEchoStore((s) => s.setMode);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!onboardingDone) return;
    // If user opened from onboarding secondary CTA pattern — no-op.
  }, [onboardingDone]);

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--grok-banner-h,0px))] items-center justify-center bg-bg">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.22em] text-cyan uppercase">
            EchoForge
          </p>
          <p className="mt-2 text-sm text-fg-muted">Tuning the memory layer…</p>
        </div>
      </div>
    );
  }

  if (!onboardingDone) {
    return <Onboarding />;
  }

  return (
    <div className="relative h-[calc(100dvh-var(--grok-banner-h,0px))] w-full overflow-hidden bg-bg">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-center pt-2">
        <button
          type="button"
          className="pointer-events-auto font-display text-sm font-medium tracking-[0.18em] text-fg/90 uppercase"
          onClick={() => setMode("ar")}
        >
          Echo<span className="text-cyan">Forge</span>
        </button>
      </header>

      <main className="h-full w-full">
        {mode === "ar" ? <ArView /> : null}
        {mode === "map" ? <MapView /> : null}
        {mode === "create" ? <CreateView /> : null}
        {mode === "profile" ? <ProfileView /> : null}
      </main>

      <BottomNav />
    </div>
  );
}
