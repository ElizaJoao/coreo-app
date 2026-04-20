import Link from "next/link";

import { ROUTES } from "../constants/routes";
import { DASHBOARD_COPY } from "../constants/ui";
import { IconSpark } from "./Icons";
import styles from "./CreateCard.module.css";

export function CreateCard() {
  return (
    <Link href={ROUTES.DASHBOARD_NEW} className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.icon}>
          <IconSpark size={22} />
        </div>
        <div className={styles.title}>{DASHBOARD_COPY.GENERATE_CARD_TITLE}</div>
        <div className={styles.sub}>{DASHBOARD_COPY.GENERATE_CARD_SUB}</div>
      </div>
    </Link>
  );
}
