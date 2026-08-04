import { Link } from "@tanstack/react-router";
import { Shield, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useEchoStore } from "@/lib/echoforge/store";
import { formatRelativeTime } from "@/lib/utils";
import { Particles } from "./Particles";
import { EchoCard } from "./EchoCard";

export function ProfileView() {
  const user = useEchoStore((s) => s.user);
  const echoes = useEchoStore((s) => s.echoes);
  const events = useEchoStore((s) => s.events);
  const stats = useEchoStore((s) => s.stats)();
  const setMode = useEchoStore((s) => s.setMode);
  const setActiveEcho = useEchoStore((s) => s.setActiveEcho);
  const { user: authUser, isPending } = useCurrentUserState();

  const created = echoes.filter((e) => user.createdEchoIds.includes(e.id));
  const saved = echoes.filter((e) => user.savedEchoIds.includes(e.id));
  const discovered = echoes.filter((e) =>
    user.discoveredEchoIds.includes(e.id),
  );

  const clearLocal = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Clear local EchoForge data on this device?")
    ) {
      localStorage.removeItem("echoforge-v1");
      window.location.reload();
    }
  };

  const openEcho = (id: string) => {
    setActiveEcho(id);
    setMode("ar");
  };

  return (
    <div className="relative h-full overflow-y-auto bg-bg">
      <Particles count={14} />
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-36 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-cyan uppercase">
              You
            </p>
            <h1 className="font-display mt-1 text-3xl font-medium tracking-tight">
              {user.displayName}
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Reputation {user.reputation} · {user.displayMode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-bg-subtle" />
            ) : (
              <>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </SignedOut>
              </>
            )}
          </div>
        </div>

        {authUser ? (
          <p className="mt-3 text-xs text-fg-subtle">
            Signed in as {authUser.displayName ?? "member"}
          </p>
        ) : (
          <p className="mt-3 text-xs text-fg-subtle">
            Wandering anonymously is fine. Sign in to carry reputation across
            devices later.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: "Nearby", value: stats.nearby },
            { label: "Discovered", value: stats.discovered },
            { label: "Created", value: stats.created },
            { label: "Saved", value: saved.length },
            { label: "Shares", value: stats.shares },
            { label: "Avg quality", value: stats.avgQuality },
          ].map((s) => (
            <div
              key={s.label}
              className="hologram-border rounded-[var(--radius-md)] px-3 py-3"
            >
              <p className="text-[10px] tracking-wide text-fg-subtle uppercase">
                {s.label}
              </p>
              <p className="font-display mt-1 text-2xl font-medium text-cyan tabular-nums">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-amber" />
            <h2 className="text-sm font-medium text-fg">Your echoes</h2>
          </div>
          {created.length === 0 ? (
            <div className="hologram-border rounded-[var(--radius-lg)] p-4 text-sm text-fg-muted">
              You haven't left anything yet.{" "}
              <button
                type="button"
                className="text-cyan underline-offset-2 hover:underline"
                onClick={() => setMode("create")}
              >
                Leave the first one
              </button>
              .
            </div>
          ) : (
            <div className="space-y-2">
              {created.map((e) => (
                <EchoCard key={e.id} echo={e} compact />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-fg">Recently discovered</h2>
          {discovered.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Walk the AR layer or open the map. The city is waiting.
            </p>
          ) : (
            <div className="space-y-2">
              {discovered
                .slice()
                .reverse()
                .slice(0, 6)
                .map((e) => (
                  <div key={e.id} onClick={() => openEcho(e.id)}>
                    <EchoCard echo={e} compact />
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-fg">Activity</h2>
          <div className="space-y-2">
            {events.slice(0, 8).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 text-xs text-fg-muted"
              >
                <span className="capitalize">{ev.type.replace("_", " ")}</span>
                <span className="tabular-nums text-fg-subtle">
                  {formatRelativeTime(ev.at)}
                </span>
              </div>
            ))}
            {events.length === 0 ? (
              <p className="text-sm text-fg-muted">No events yet.</p>
            ) : null}
          </div>
        </section>

        <section className="mt-10 hologram-border rounded-[var(--radius-lg)] p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 text-cyan" />
            <div>
              <h2 className="text-sm font-medium text-fg">Privacy</h2>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                Precise location is only used while exploring. Demo data stays
                on this device. One-tap wipe below.
              </p>
              <Button
                className="mt-3"
                size="sm"
                variant="danger"
                onClick={clearLocal}
              >
                <Trash2 className="size-3.5" />
                Delete local data
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-fg-subtle">
          EchoForge · The living memory layer of the world.
          <br />
          Stories, secrets, and the numbers that prove them.
        </p>
      </div>
    </div>
  );
}
