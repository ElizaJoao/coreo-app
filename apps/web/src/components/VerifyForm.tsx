import { VERIFICATION_CODE_LENGTH, type VerificationMethod } from "../constants/auth";
import styles from "./VerifyForm.module.css";

export type VerifyFormProps = {
  method: VerificationMethod;
  destination: string;
  code: string;
  error?: string;
  isSubmitting: boolean;
  isResending: boolean;
  isCodeValid: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
};

export function VerifyForm(props: VerifyFormProps) {
  const dest =
    props.method === "email"
      ? `email sent to ${props.destination}`
      : `SMS sent to ${props.destination}`;

  return (
    <form onSubmit={props.onSubmit} className={styles.form}>
      <div>
        <h1 className={styles.title}>Check your {props.method === "email" ? "inbox" : "phone"}</h1>
        <p className={styles.subtitle}>Enter the {VERIFICATION_CODE_LENGTH}-digit code from the {dest}.</p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={VERIFICATION_CODE_LENGTH}
            value={props.code}
            onChange={(e) => props.onCodeChange(e.target.value.replace(/\D/g, ""))}
            className={styles.codeInput}
            placeholder="------"
            autoFocus
          />
          {props.error ? <p className={styles.fieldError}>{props.error}</p> : null}
        </div>
      </div>

      {props.error ? <p className={styles.formError}>{props.error}</p> : null}

      <button
        type="submit"
        disabled={props.isSubmitting || !props.isCodeValid}
        className={styles.submitBtn}
      >
        {props.isSubmitting ? "Verifying..." : "Verify & create account"}
      </button>

      <button
        type="button"
        disabled={props.isResending}
        onClick={props.onResend}
        className={styles.resendBtn}
      >
        {props.isResending ? "Sending..." : "Resend code"}
      </button>
    </form>
  );
}
