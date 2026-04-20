"use client";

import { signOut } from "next-auth/react";

import { ROUTES } from "../constants/routes";
import styles from "./SignOutButton.module.css";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
      className={styles.btn}
    >
      Sign out
    </button>
  );
}
