import { FeaturesSection } from "../components/FeaturesSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHero } from "../components/LandingHero";
import { LandingNav } from "../components/LandingNav";
import { MarketplaceSection } from "../components/MarketplaceSection";
import { PricingSection } from "../components/PricingSection";
import { ProductPreview } from "../components/ProductPreview";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { ROUTES } from "../constants/routes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className={styles.main}>
        <LandingHero loginHref={ROUTES.LOGIN} signupHref={ROUTES.SIGNUP} />
        <ProductPreview />
        <div className={styles.divider} />
        <FeaturesSection />
        <div className={styles.divider} />
        <MarketplaceSection />
        <div className={styles.divider} />
        <TestimonialsSection />
        <div className={styles.divider} />
        <div id="pricing">
          <PricingSection signupHref={ROUTES.SIGNUP} />
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
