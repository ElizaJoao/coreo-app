export const PLANS = ["free", "pro", "max"] as const;
export type Plan = (typeof PLANS)[number];

export type PlanMeta = {
  id: Plan;
  name: string;
  price: number; // USD/month, 0 = free
  description: string;
  features: string[];
  limit: number | null; // choreographies/month, null = unlimited
  highlight: boolean;
  badge?: string;
};

export const PLAN_META: Record<Plan, PlanMeta> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    description: "5 choreographies/month · Up to 45 min classes",
    features: [
      "5 choreographies / month",
      "Up to 45 min class duration",
      "AI move sequence generation",
      "Music suggestions (title, artist, BPM)",
      "Drag-and-drop sequence editor",
    ],
    limit: 5,
    highlight: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 12,
    description: "For active instructors.",
    features: [
      "Unlimited choreographies",
      "Everything in Free",
      "Video demo link per move",
      "Student share page (public link)",
    ],
    limit: null,
    highlight: true,
    badge: "Most popular",
  },
  max: {
    id: "max",
    name: "Max",
    price: 29,
    description: "For serious instructors & studios.",
    features: [
      "Everything in Pro",
      "AI verbal cues per move",
      "Rehearsal Mode (fullscreen timer)",
      "Priority AI generation",
    ],
    limit: null,
    highlight: false,
    badge: "Best value",
  },
};
