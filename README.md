# EchoForge

The living memory layer of the world.

**Tagline:** Leave an echo. Discover the world’s living memory.  
**Secondary:** Stories, secrets, and the numbers that prove them — tied to the places that matter.

## What this is

A demo-quality progressive web experience for **EchoForge**:

- **AR Walk** — holographic nearby markers (device camera optional; fallback field)
- **Density Map** — canvas heatmap of location-tied echoes
- **Leave an echo** — low-friction text creation with mood tags + optional cycle reports
- **Serendipity** — random nearby discovery
- **Profile** — reputation, saved/created, privacy wipe, optional sign-in

Magic first, measurable second. Brand: deep charcoal, electric cyan, soft amber.

## Success metrics (product definition of “working”)

Instrumented events: `discover`, `create`, `share`, `cycle_view`.

| Area | Target |
| --- | --- |
| Traffic | 50k–100k MAU / 90 days; ≥25–30% organic share installs |
| Plays | ≥10–12 interactions / WAU |
| Conversion | ≥5% free → premium |
| Retention | D1 ≥40%, D7 ≥20–22%, D30 ≥10% |
| Quality | avg echo quality ≥7.8; spam surface <1.5% |
| Density | launch cities ≥3–4 high-quality echoes / km² |

## Privacy

- Precise location only while exploring (browser geolocation optional)
- Demo walk controls for environments without GPS
- One-tap local data delete on Profile
- Anonymous / pseudonym / verified display modes

## Stack

React 19 · TanStack Start · Tailwind v4 · Zustand · Lucide

## Scripts

- `npm run dev` — app on `0.0.0.0:8080`
- `npm run build` — production build
- `npm run typecheck` — TypeScript
