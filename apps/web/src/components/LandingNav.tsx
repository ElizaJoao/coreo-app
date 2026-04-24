import Link from "next/link";
import { ROUTES } from "../constants/routes";
import styles from "./LandingNav.module.css";

export function LandingNav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <img src="/logo-mark.svg" alt="" className={styles.mark} />
        <span className={styles.brandName}>Offbeat</span>
      </Link>
      <div className={styles.links}>
        <a href="#features" className={styles.link}>Features</a>
        <a href="#pricing" className={styles.link}>Pricing</a>
      </div>
      <div className={styles.actions}>
        <Link href={ROUTES.LOGIN} className={styles.btnSecondary}>Sign in</Link>
        <Link href={ROUTES.SIGNUP} className={styles.btnPrimary}>Get started free</Link>
      </div>
    </nav>
  );
}
