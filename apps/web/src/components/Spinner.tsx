import styles from "./Spinner.module.css";

export function Spinner() {
  return <span className={styles.spin} aria-hidden />;
}
