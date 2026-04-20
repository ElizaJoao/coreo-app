export const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
export const VERIFICATION_CODE_LENGTH = 6;

export const VERIFICATION_METHODS = ["email", "sms"] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_EXISTS: "An account with this email already exists.",
  SIGNUP_FAILED: "Failed to create account. Please try again.",
  INVALID_CODE: "Incorrect or expired verification code.",
  SEND_FAILED: "Failed to send verification code. Please try again.",
  PHONE_REQUIRED: "A phone number is required for SMS verification.",
} as const;
