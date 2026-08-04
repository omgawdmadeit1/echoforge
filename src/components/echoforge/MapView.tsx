import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  distanceMeters,
  projectToMap,
  sortByDistance,
} from "@/lib/echoforge/geo";
import { useEchoStore } from "@/lib/echoforge/store";
import { cn } from "@/lib/utils";
import { EchoCard } from "./EchoCard";

export function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 700 });
  const [scale, setScale] = useState(90000);
  const [center, setCenter] = useState(() => useEchoStore.getState().position);

  const echoes = useEchoStore((s) => s.echoes);
  const position = useEchoStore((s) => s.position);
  const discoverEcho = useEchoStore((s) => s.discoverEcho);
  const activeEchoId = useEchoStore((s) => s.activeEchoId);
  const setActiveEcho = useEchoStore((s) => s.setActiveEcho);
  const activeEcho = echoes.find((e) => e.id === activeEchoId) ?? null;

  const sorted = useMemo(
    () => sortByDistance(echoes, position).slice(0, 40),
    [echoes, position],
  );

  useEffect(() => {
    setCenter(position);
  }, [position.lat, position.lng]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        w: Math.floor(entry.contentRect.width),
        h: Math.floor(entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, size.w, size.h);

    ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < size.w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
      ctx.stroke();
    }
    for (let y = 0; y < size.h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
      ctx.stroke();
    }

    for (const echo of echoes) {
      const p = projectToMap(
        { lat: echo.lat, lng: echo.lng },
        center,
        size.w,
        size.h,
        scale,
      );
      if (p.x < -80 || p.y < -80 || p.x > size.w + 80 || p.y > size.h + 80) continue;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 56);
      g.addColorStop(0, "rgba(34, 211, 238, 0.28)");
      g.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 56, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(232, 232, 236, 0.05)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, size.h * 0.55);
    ctx.quadraticCurveTo(size.w * 0.4, size.h * 0.4, size.w, size.h * 0.62);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size.w * 0.1, 0);
    ctx.quadraticCurveTo(size.w * 0.45, size.h * 0.5, size.w * 0.55, size.h);
    ctx.stroke();

    for (const echo of echoes) {
      const p = projectToMap(
        { lat: echo.lat, lng: echo.lng },
        center,
        size.w,
        size.h,
        scale,
      );
      if (p.x < -20 || p.y < -20 || p.x > size.w + 20 || p.y > size.h + 20) continue;
      const active = echo.id === activeEchoId;
      const hasCycle = Boolean(echo.cycle);
      ctx.beginPath();
      ctx.fillStyle = hasCycle
        ? "rgba(240, 180, 41, 0.95)"
        : "rgba(34, 211, 238, 0.95)";
      ctx.shadowColor = hasCycle
        ? "rgba(240, 180, 41, 0.65)"
        : "rgba(34, 211, 238, 0.65)";
      ctx.shadowBlur = active ? 18 : 10;
      ctx.arc(p.x, p.y, active ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (active) {
        ctx.strokeStyle = "rgba(232, 232, 236, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const me = projectToMap(position, center, size.w, size.h, scale);
    ctx.beginPath();
    ctx.fillStyle = "#e8e8ec";
    ctx.arc(me.x, me.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(me.x, me.y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }, [size, scale, center, echoes, position, activeEchoId]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { id: string; d: number } | null = null;
    for (const echo of echoes) {
      const p = projectToMap(
        { lat: echo.lat, lng: echo.lng },
        center,
        size.w,
        size.h,
        scale,
      );
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 22 && (!best || d < best.d)) best = { id: echo.id, d };
    }
    if (best) discoverEcho(best.id);
    else setActiveEcho(null);
  };

  const densityNote =
    sorted.filter((e) => distanceMeters(position, { lat: e.lat, lng: e.lng }) < 3000)
      .length >= 3
      ? "The city remembers here."
      : "This area is quiet — be the first.";

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-bg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        onClick={onCanvasClick}
      />

      <div className="safe-pt absolute inset-x-0 top-10 z-10 px-4">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-2">
          <div className="hologram-border rounded-[var(--radius-lg)] px-3 py-2">
            <p className="text-[10px] tracking-[0.2em] text-cyan uppercase">
              Density map
            </p>
            <p className="text-xs text-fg-muted">{densityNote}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setScale((s) => Math.min(180000, s * 1.25))}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setScale((s) => Math.max(12000, s / 1.25))}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setCenter(position)}
              aria-label="Center on me"
            >
              <LocateFixed className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[5.5rem] top-32 z-10 flex items-end px-3">
        <div className="mx-auto max-h-full w-full max-w-lg overflow-y-auto">
          {activeEcho ? (
            <EchoCard echo={activeEcho} />
          ) : (
            <div className="space-y-2">
              <p className="px-1 text-[11px] tracking-wide text-fg-subtle uppercase">
                Nearby echoes
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sorted.slice(0, 8).map((echo) => (
                  <div key={echo.id} className="min-w-[220px] shrink-0">
                    <EchoCard echo={echo} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-24 left-4 z-10 flex items-center gap-3 text-[10px] text-fg-subtle">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-cyan" /> Echo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber" /> With cycle
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full bg-fg")} /> You
        </span>
      </div>
    </div>
  );
}
