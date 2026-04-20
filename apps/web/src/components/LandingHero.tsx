import Link from "next/link";

import styles from "./LandingHero.module.css";

export type LandingHeroProps = {
  loginHref: string;
  signupHref: string;
};

export function LandingHero({ loginHref, signupHref }: LandingHeroProps) {
  return (
    <section className={styles.section}>
      <span className={styles.eyebrow}>Coreo</span>
      <h1 className={styles.title}>Choreographies,{"\n"}crafted by AI</h1>
      <p className={styles.subtitle}>
        Describe your class and let Coreo generate a complete move sequence — style, duration,
        difficulty, and music suggestion included.
      </p>
      <div className={styles.actions}>
        <Link href={signupHref} className={styles.btnPrimary}>
          Get started free
        </Link>
        <Link href={loginHref} className={styles.btnSecondary}>
          Sign in
        </Link>
      </div>
    </section>
  );
}
