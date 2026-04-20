export const DANCE_CATEGORIES = ["All", "Dance", "Fitness"] as const;
export type DanceCategory = (typeof DANCE_CATEGORIES)[number];

export const DIFFICULTY_FILTERS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
export type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number];

export const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  Beginner: "New to the style. Simple patterns, accessible pace.",
  Intermediate: "Some experience. Coordinated movement, moderate intensity.",
  Advanced: "Fluent in the form. Complex sequences, full energy.",
};

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", route: "/dashboard" },
  { id: "new", label: "New choreography", route: "/dashboard/new" },
  { id: "library", label: "Library", route: "/dashboard/library" },
  { id: "schedule", label: "Schedule", route: "/dashboard/schedule" },
  { id: "insights", label: "Insights", route: "/dashboard/insights" },
] as const;

export const NAV_SECONDARY = [
  { id: "settings", label: "Settings", route: "/dashboard/settings" },
] as const;

export const DASHBOARD_COPY = {
  PAGE_TITLE_PLAIN: "Today's",
  PAGE_TITLE_ACCENT: "tempo",
  PAGE_SUBTITLE: "Your students are waiting for the beat.",
  GENERATE_CARD_TITLE: "Generate a choreography",
  GENERATE_CARD_SUB: "Pick a style, BPM, and audience — AI builds the sequence.",
} as const;
