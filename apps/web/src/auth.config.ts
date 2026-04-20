import type { NextAuthConfig } from "next-auth";

import { ROUTES } from "./constants/routes";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: ROUTES.LOGIN,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD);

      if (isDashboard) return isLoggedIn;
      return true;
    },
  },
};
