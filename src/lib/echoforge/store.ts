import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import { DEFAULT_CENTER, SEED_ECHOES } from "./seed";
import { nearbyEchoes, offsetPoint } from "./geo";
import type {
  AppMode,
  CycleReport,
  Echo,
  GeoPoint,
  InstrumentationEvent,
  MoodTag,
  UserProfile,
} from "./types";

type CreateEchoInput = {
  text: string;
  moodTags: MoodTag[];
  displayMode: UserProfile["displayMode"];
  contentType?: Echo["contentType"];
  cycle?: CycleReport;
  placeLabel?: string;
};

type EchoStore = {
  ready: boolean;
  mode: AppMode;
  user: UserProfile;
  position: GeoPoint;
  heading: number;
  echoes: Echo[];
  activeEchoId: string | null;
  events: InstrumentationEvent[];
  onboardingDone: boolean;
  cameraEnabled: boolean;
  setMode: (mode: AppMode) => void;
  setActiveEcho: (id: string | null) => void;
  setOnboardingDone: () => void;
  setCameraEnabled: (v: boolean) => void;
  setHeading: (h: number) => void;
  setPosition: (p: GeoPoint) => void;
  walkDemo: (northM: number, eastM: number) => void;
  resetPosition: () => void;
  discoverEcho: (id: string) => void;
  saveEcho: (id: string) => void;
  unsaveEcho: (id: string) => void;
  createEcho: (input: CreateEchoInput) => Echo;
  deleteOwnEcho: (id: string) => void;
  serendipity: () => Echo | null;
  track: (
    type: InstrumentationEvent["type"],
    echoId?: string,
    meta?: InstrumentationEvent["meta"],
  ) => void;
  hydrate: () => void;
  stats: () => {
    totalEchoes: number;
    nearby: number;
    discovered: number;
    created: number;
    shares: number;
    avgQuality: number;
  };
};

const defaultUser = (): UserProfile => ({
  id: "local_wanderer",
  displayName: "Wanderer",
  displayMode: "pseudonym",
  reputation: 12,
  createdEchoIds: [],
  savedEchoIds: [],
  discoveredEchoIds: [],
});

function mergeSeed(existing: Echo[]): Echo[] {
  const byId = new Map(existing.map((e) => [e.id, e]));
  for (const seed of SEED_ECHOES) {
    if (!byId.has(seed.id)) byId.set(seed.id, seed);
  }
  return Array.from(byId.values());
}

function makeEvent(
  type: InstrumentationEvent["type"],
  echoId?: string,
  meta?: InstrumentationEvent["meta"],
): InstrumentationEvent {
  return {
    id: uid("evt"),
    type,
    echoId,
    at: new Date().toISOString(),
    meta,
  };
}

export const useEchoStore = create<EchoStore>()(
  persist(
    (set, get) => ({
      ready: false,
      mode: "ar",
      user: defaultUser(),
      position: { ...DEFAULT_CENTER },
      heading: 18,
      echoes: SEED_ECHOES,
      activeEchoId: null,
      events: [],
      onboardingDone: false,
      cameraEnabled: false,

      hydrate: () => {
        set((s) => ({
          ready: true,
          echoes: mergeSeed(s.echoes),
        }));
      },

      setMode: (mode) => set({ mode }),
      setActiveEcho: (id) => set({ activeEchoId: id }),
      setOnboardingDone: () => set({ onboardingDone: true }),
      setCameraEnabled: (v) => set({ cameraEnabled: v }),
      setHeading: (h) => set({ heading: h }),
      setPosition: (p) => set({ position: p }),

      walkDemo: (northM, eastM) => {
        const pos = get().position;
        set({ position: offsetPoint(pos, northM, eastM) });
      },

      resetPosition: () => set({ position: { ...DEFAULT_CENTER } }),

      discoverEcho: (id) => {
        const { user, echoes, events } = get();
        if (user.discoveredEchoIds.includes(id)) {
          set({ activeEchoId: id });
          return;
        }
        set({
          activeEchoId: id,
          user: {
            ...user,
            discoveredEchoIds: [...user.discoveredEchoIds, id],
            reputation: user.reputation + 1,
          },
          echoes: echoes.map((e) =>
            e.id === id
              ? { ...e, discoveredCount: (e.discoveredCount ?? 0) + 1 }
              : e,
          ),
          events: [makeEvent("discover", id), ...events].slice(0, 200),
        });
      },

      saveEcho: (id) => {
        const { user } = get();
        if (user.savedEchoIds.includes(id)) return;
        set({
          user: { ...user, savedEchoIds: [...user.savedEchoIds, id] },
        });
      },

      unsaveEcho: (id) => {
        const { user } = get();
        set({
          user: {
            ...user,
            savedEchoIds: user.savedEchoIds.filter((x) => x !== id),
          },
        });
      },

      createEcho: (input) => {
        const { user, position, echoes, events } = get();
        const echo: Echo = {
          id: uid("echo"),
          creatorId: user.id,
          creatorName:
            input.displayMode === "anonymous" ? "Anonymous" : user.displayName,
          displayMode: input.displayMode,
          lat: position.lat,
          lng: position.lng,
          contentType: input.contentType ?? "text",
          text: input.text.trim(),
          moodTags: input.moodTags,
          qualityScore: 7.8 + Math.random() * 1.4,
          visibility: "public",
          createdAt: new Date().toISOString(),
          placeLabel: input.placeLabel ?? "Here",
          discoveredCount: 0,
          cycle: input.cycle,
        };
        set({
          echoes: [echo, ...echoes],
          user: {
            ...user,
            createdEchoIds: [echo.id, ...user.createdEchoIds],
            reputation: user.reputation + 3,
          },
          activeEchoId: echo.id,
          mode: "ar",
          events: [makeEvent("create", echo.id), ...events].slice(0, 200),
        });
        return echo;
      },

      deleteOwnEcho: (id) => {
        const { user, echoes } = get();
        if (!user.createdEchoIds.includes(id)) return;
        set({
          echoes: echoes.filter((e) => e.id !== id),
          user: {
            ...user,
            createdEchoIds: user.createdEchoIds.filter((x) => x !== id),
          },
          activeEchoId: null,
        });
      },

      serendipity: () => {
        const { echoes, position } = get();
        const pool = nearbyEchoes(echoes, position, 8000);
        if (!pool.length) return null;
        const pick = pool[Math.floor(Math.random() * pool.length)]!;
        get().discoverEcho(pick.id);
        return pick;
      },

      track: (type, echoId, meta) => {
        set((s) => ({
          events: [makeEvent(type, echoId, meta), ...s.events].slice(0, 200),
        }));
      },

      stats: () => {
        const { echoes, user, events, position } = get();
        const near = nearbyEchoes(echoes, position, 3000);
        const qualities = echoes.map((e) => e.qualityScore);
        const avg =
          qualities.reduce((a, b) => a + b, 0) / Math.max(1, qualities.length);
        return {
          totalEchoes: echoes.length,
          nearby: near.length,
          discovered: user.discoveredEchoIds.length,
          created: user.createdEchoIds.length,
          shares: events.filter((e) => e.type === "share").length,
          avgQuality: Math.round(avg * 10) / 10,
        };
      },
    }),
    {
      name: "echoforge-v1",
      partialize: (s) => ({
        user: s.user,
        echoes: s.echoes,
        events: s.events,
        onboardingDone: s.onboardingDone,
        position: s.position,
      }),
    },
  ),
);
