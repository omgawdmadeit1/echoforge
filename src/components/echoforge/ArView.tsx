import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Navigation,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bearingDegrees,
  distanceMeters,
  formatDistance,
  nearbyEchoes,
  sortByDistance,
} from "@/lib/echoforge/geo";
import { useEchoStore } from "@/lib/echoforge/store";
import { cn } from "@/lib/utils";
import { Particles } from "./Particles";
import { EchoCard } from "./EchoCard";

function projectOnScreen(
  bearing: number,
  heading: number,
  distance: number,
  width: number,
  height: number,
) {
  const rel = ((bearing - heading + 540) % 360) - 180;
  const fov = 70;
  const x = width / 2 + (rel / (fov / 2)) * (width / 2) * 0.55;
  const depth = Math.min(1, distance / 400);
  const y = height * (0.38 + depth * 0.28);
  const scale = 1.15 - depth * 0.55;
  const visible = Math.abs(rel) < fov * 0.7;
  return { x, y, scale, visible, rel };
}

export function ArView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 700 });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [walkOpen, setWalkOpen] = useState(false);

  const echoes = useEchoStore((s) => s.echoes);
  const position = useEchoStore((s) => s.position);
  const heading = useEchoStore((s) => s.heading);
  const setHeading = useEchoStore((s) => s.setHeading);
  const cameraEnabled = useEchoStore((s) => s.cameraEnabled);
  const setCameraEnabled = useEchoStore((s) => s.setCameraEnabled);
  const discoverEcho = useEchoStore((s) => s.discoverEcho);
  const activeEchoId = useEchoStore((s) => s.activeEchoId);
  const walkDemo = useEchoStore((s) => s.walkDemo);
  const resetPosition = useEchoStore((s) => s.resetPosition);
  const setPosition = useEchoStore((s) => s.setPosition);

  const nearby = useMemo(
    () => sortByDistance(nearbyEchoes(echoes, position, 3500), position).slice(0, 12),
    [echoes, position],
  );

  const activeEcho = echoes.find((e) => e.id === activeEchoId) ?? null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (!cameraEnabled || !videoRef.current) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraError(null);
      } catch {
        setCameraError("Camera unavailable — using holographic field.");
        setCameraEnabled(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [cameraEnabled, setCameraEnabled]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (
          typeof pos.coords.heading === "number" &&
          !Number.isNaN(pos.coords.heading)
        ) {
          setHeading(pos.coords.heading);
        }
      },
      () => {
        /* keep demo position */
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [setHeading, setPosition]);

  const markers = nearby.map((echo) => {
    const dist = distanceMeters(position, { lat: echo.lat, lng: echo.lng });
    const bearing = bearingDegrees(position, { lat: echo.lat, lng: echo.lng });
    const screen = projectOnScreen(bearing, heading, dist, size.w, size.h);
    return { echo, dist, bearing, ...screen };
  });

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-bg">
      {cameraEnabled ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          autoPlay
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-cyan)_12%,transparent)_0%,var(--color-bg)_65%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(color-mix(in_oklab,var(--color-cyan)_8%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-cyan)_8%,transparent)_1px,transparent_1px)] [background-size:48px_48px]" />
          <Particles count={40} />
        </>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-cyan) 40%, transparent), transparent)",
          animation: "scanline 7s linear infinite",
        }}
        aria-hidden
      />

      <div className="safe-pt absolute inset-x-0 top-10 z-20 px-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <div className="hologram-border rounded-[var(--radius-lg)] px-3 py-2">
            <p className="text-[10px] tracking-[0.2em] text-cyan uppercase">
              AR walk
            </p>
            <p className="text-xs text-fg-muted">
              {nearby.length === 0
                ? "This place is quiet. Be the first."
                : `${nearby.length} nearby · ${formatDistance(markers[0]?.dist ?? 0)} closest`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setCameraEnabled(!cameraEnabled)}
              aria-label={cameraEnabled ? "Disable camera" : "Enable camera"}
            >
              {cameraEnabled ? (
                <VideoOff className="size-4" />
              ) : (
                <Video className="size-4" />
              )}
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setHeading((heading + 25) % 360)}
              aria-label="Rotate view"
            >
              <Compass className="size-4" />
            </Button>
          </div>
        </div>
        {cameraError ? (
          <p className="mx-auto mt-2 max-w-lg text-center text-[11px] text-amber">
            {cameraError}
          </p>
        ) : null}
      </div>

      <div className="absolute inset-0 z-10">
        {markers.map(({ echo, dist, x, y, scale, visible }) => {
          if (!visible) return null;
          return (
            <button
              key={echo.id}
              type="button"
              onClick={() => discoverEcho(echo.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
              style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              <span className="absolute inset-0 rounded-full animate-pulse-ring border border-cyan/50" />
              <span
                className={cn(
                  "animate-marker relative flex size-12 flex-col items-center justify-center rounded-full border border-cyan/60 bg-bg/70 text-[10px] text-cyan backdrop-blur-md",
                  echo.cycle && "border-amber/70 text-amber",
                )}
              >
                <span className="size-2 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
              </span>
              <span className="mt-1 block max-w-[120px] truncate rounded-full bg-bg/70 px-2 py-0.5 text-center text-[10px] text-fg backdrop-blur-sm">
                {formatDistance(dist)}
              </span>
            </button>
          );
        })}
      </div>

      {!activeEcho ? (
        <div className="absolute bottom-28 left-3 z-20">
          <div className="hologram-border w-[148px] overflow-hidden rounded-[var(--radius-lg)]">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-[10px] tracking-wide text-fg-muted uppercase"
              onClick={() => setWalkOpen((v) => !v)}
            >
              Demo walk
              {walkOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </button>
            {walkOpen ? (
              <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                <span />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => walkDemo(45, 0)}
                  aria-label="Walk north"
                >
                  <Navigation className="size-3.5" />
                </Button>
                <span />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => walkDemo(0, -45)}
                  aria-label="Walk west"
                >
                  <Navigation className="size-3.5 -rotate-90" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 px-1 text-[10px]"
                  onClick={resetPosition}
                >
                  Home
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => walkDemo(0, 45)}
                  aria-label="Walk east"
                >
                  <Navigation className="size-3.5 rotate-90" />
                </Button>
                <span />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => walkDemo(-45, 0)}
                  aria-label="Walk south"
                >
                  <Navigation className="size-3.5 rotate-180" />
                </Button>
                <span />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!activeEcho ? (
        <div className="absolute inset-x-0 bottom-28 z-20 px-3">
          <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nearby.slice(0, 6).map((echo) => (
              <button
                key={echo.id}
                type="button"
                onClick={() => discoverEcho(echo.id)}
                className="hologram-border min-w-[200px] max-w-[220px] shrink-0 rounded-[var(--radius-lg)] p-3 text-left"
              >
                <p className="line-clamp-2 text-xs leading-snug text-fg">
                  {echo.text}
                </p>
                <p className="mt-2 text-[10px] text-cyan">
                  {formatDistance(
                    distanceMeters(position, { lat: echo.lat, lng: echo.lng }),
                  )}{" "}
                  · {echo.placeLabel}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeEcho ? (
        <div className="absolute inset-x-0 bottom-[5.5rem] top-28 z-30 flex items-end px-3 pb-2">
          <div className="mx-auto max-h-full w-full max-w-md overflow-y-auto overscroll-contain">
            <EchoCard echo={activeEcho} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
