import Link from "next/link";
import { ROUTES } from "../constants/routes";
import styles from "./LandingFooter.module.css";

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src="/logo-mark.svg" alt="" className={styles.mark} />
          <span className={styles.brandName}>Offbeat</span>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <div className={styles.colTitle}>Product</div>
            <a href="#features" className={styles.colLink}>Features</a>
            <a href="#pricing" className={styles.colLink}>Pricing</a>
            <Link href={ROUTES.SIGNUP} className={styles.colLink}>Get started</Link>
          </div>
          <div className={styles.col}>
            <div className={styles.colTitle}>Account</div>
            <Link href={ROUTES.LOGIN} className={styles.colLink}>Sign in</Link>
            <Link href={ROUTES.SIGNUP} className={styles.colLink}>Create account</Link>
            <Link href={ROUTES.FORGOT_PASSWORD} className={styles.colLink}>Reset password</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Offbeat. All rights reserved.</span>
        <span className={styles.bottomDot} />
        <span>Built with Claude AI</span>
      </div>
    </footer>
  );
}
