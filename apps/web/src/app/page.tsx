import { FeaturesSection } from "../components/FeaturesSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHero } from "../components/LandingHero";
import { LandingNav } from "../components/LandingNav";
import { PricingSection } from "../components/PricingSection";
import { ROUTES } from "../constants/routes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className={styles.main}>
        <LandingHero loginHref={ROUTES.LOGIN} signupHref={ROUTES.SIGNUP} />
        <div className={styles.divider} />
        <FeaturesSection />
        <div className={styles.divider} />
        <div id="pricing">
          <PricingSection signupHref={ROUTES.SIGNUP} />
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
