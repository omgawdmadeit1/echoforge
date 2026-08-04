import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/echoforge/Particles";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-[calc(100dvh-var(--grok-banner-h,0px))] place-items-center overflow-hidden bg-bg px-6">
      <Particles count={24} />
      <div className="hologram-border relative z-10 w-full max-w-sm rounded-[var(--radius-xl)] p-6 panel-shadow">
        <p className="text-[11px] font-medium tracking-[0.22em] text-cyan uppercase">
          EchoForge
        </p>
        <h1 className="font-display mt-2 text-2xl font-medium tracking-tight text-fg">
          Carry your reputation
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Sign in to keep discoveries across devices. Or stay anonymous — the
          city still listens.
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-fg-subtle">Sign-in is disabled.</p>
          )}
        </div>
        <Button asChild variant="ghost" className="mt-4 w-full">
          <Link to="/">Back to wandering</Link>
        </Button>
      </div>
    </main>
  );
}
