import Link from "next/link";

import styles from "./LandingHero.module.css";

export type LandingHeroProps = {
  loginHref: string;
  signupHref: string;
};

export function LandingHero({ loginHref, signupHref }: LandingHeroProps) {
  return (
    <section className={styles.section}>
      <span className={styles.eyebrow}>
        <span className={styles.eyebrowDot} />
        AI-powered choreography
      </span>

      <h1 className={styles.title}>
        {"Choreographies,\n"}
        <span className={styles.titleAccent}>crafted by AI</span>
      </h1>

      <p className={styles.subtitle}>
        Describe your class and let Offbeat generate a complete move
        sequence — style, duration, difficulty, and music included.
      </p>

      <div className={styles.actions}>
        <Link href={signupHref} className={styles.btnPrimary}>
          Get started free →
        </Link>
        <Link href={loginHref} className={styles.btnSecondary}>
          Sign in
        </Link>
      </div>

      <div className={styles.proof}>
        <span>No credit card required</span>
        <span className={styles.proofDot} />
        <span>5 free choreographies / month</span>
        <span className={styles.proofDot} />
        <span>Cancel anytime</span>
      </div>
    </section>
  );
}
