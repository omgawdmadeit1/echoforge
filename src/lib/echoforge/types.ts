export type ContentType = "text" | "audio" | "video" | "hybrid";
export type DisplayMode = "anonymous" | "pseudonym" | "verified";
export type MoodTag =
  | "wonder"
  | "confession"
  | "tip"
  | "history"
  | "quiet"
  | "hope"
  | "warning"
  | "poetry"
  | "data";

export type CycleMetric = {
  label: string;
  value: number | string;
  unit?: string;
};

export type CycleReport = {
  id: string;
  title: string;
  hypothesis?: string;
  outcome: string;
  confidence: number; // 0-100
  metrics: CycleMetric[];
  notes?: string;
};

export type Echo = {
  id: string;
  creatorId: string;
  creatorName: string;
  displayMode: DisplayMode;
  lat: number;
  lng: number;
  altitude?: number;
  contentType: ContentType;
  text?: string;
  audioUrl?: string;
  videoUrl?: string;
  durationSec?: number;
  moodTags: MoodTag[];
  qualityScore: number;
  visibility: "public" | "local" | "fading";
  createdAt: string;
  isSeed?: boolean;
  placeLabel?: string;
  cycle?: CycleReport;
  discoveredCount?: number;
};

export type UserProfile = {
  id: string;
  displayName: string;
  displayMode: DisplayMode;
  reputation: number;
  createdEchoIds: string[];
  savedEchoIds: string[];
  discoveredEchoIds: string[];
};

export type AppMode = "ar" | "map" | "create" | "profile";

export type GeoPoint = { lat: number; lng: number };

export type InstrumentationEvent = {
  id: string;
  type: "discover" | "create" | "share" | "report" | "cycle_view";
  echoId?: string;
  at: string;
  meta?: Record<string, string | number | boolean>;
};
