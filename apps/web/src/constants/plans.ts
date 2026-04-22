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
    description: "Perfect for trying it out.",
    features: [
      "5 choreographies / month",
      "AI generation (standard)",
      "Move sequence editor",
      "Email verification",
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
      "Advanced AI generation",
      "Music search with preview",
      "Priority generation speed",
      "PDF export",
    ],
    limit: null,
    highlight: true,
    badge: "Most popular",
  },
  max: {
    id: "max",
    name: "Max",
    price: 29,
    description: "For studios and teams.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "Usage analytics",
      "Dedicated support",
    ],
    limit: null,
    highlight: false,
    badge: "Best value",
  },
};
