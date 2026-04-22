export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY: "/verify",
  DASHBOARD: "/dashboard",
  DASHBOARD_NEW: "/dashboard/new",
  DASHBOARD_ITEM: (id: string) => `/dashboard/${id}`,
  DASHBOARD_UPGRADE: "/dashboard/upgrade",
  FORGOT_PASSWORD: "/forgot-password",
} as const;
