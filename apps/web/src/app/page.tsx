import { LandingHero } from "../components/LandingHero";
import { ROUTES } from "../constants/routes";

export default function Home() {
  return (
    <main>
      <LandingHero loginHref={ROUTES.LOGIN} signupHref={ROUTES.SIGNUP} />
    </main>
  );
}
