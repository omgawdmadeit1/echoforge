import { Button } from "@/components/ui/button";
import { Particles } from "./Particles";
import { useEchoStore } from "@/lib/echoforge/store";

export function Onboarding() {
  const setOnboardingDone = useEchoStore((s) => s.setOnboardingDone);
  const setMode = useEchoStore((s) => s.setMode);

  const begin = (mode: "ar" | "map") => {
    setMode(mode);
    setOnboardingDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <Particles count={36} />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-10 pt-16 sm:justify-center sm:px-10">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <p className="mb-3 text-xs font-medium tracking-[0.22em] text-cyan uppercase">
            EchoForge
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-medium tracking-tight text-fg text-balance sm:text-5xl">
            Leave an echo.
            <br />
            Discover the world's living memory.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-muted">
            Walk through places. Hear what others left behind. Add your own —
            quietly, carefully, forever if you choose.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-fg-muted">
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan" />
              <span>AR walk mode finds nearby echoes as luminous markers.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber" />
              <span>Map density shows where the city already remembers.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-glow" />
              <span>Optional data cycles turn observations into one-page proofs.</span>
            </li>
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" size="lg" onClick={() => begin("ar")}>
              Begin wandering
            </Button>
            <Button
              className="flex-1"
              size="lg"
              variant="secondary"
              onClick={() => begin("map")}
            >
              Explore the map
            </Button>
          </div>
          <p className="mt-6 text-xs text-fg-subtle">
            Location stays on-device for this demo. Precise location is only used
            while you explore.
          </p>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-cyan/10 to-transparent"
        aria-hidden
      />
    </div>
  );
}
