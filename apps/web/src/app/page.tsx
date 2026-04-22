import { LandingHero } from "../components/LandingHero";
import { PricingSection } from "../components/PricingSection";
import { ROUTES } from "../constants/routes";

export default function Home() {
  return (
    <main>
      <LandingHero loginHref={ROUTES.LOGIN} signupHref={ROUTES.SIGNUP} />
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border-2),transparent)", maxWidth: 900, margin: "0 auto" }} />
      <PricingSection signupHref={ROUTES.SIGNUP} />
    </main>
  );
}
