const SESSION_KEY = "coreo_pending_verify";

export type PendingVerifySession = {
  email: string;
  password: string;
};

export function savePendingVerifySession(data: PendingVerifySession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function loadPendingVerifySession(): PendingVerifySession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as PendingVerifySession;
}

export function clearPendingVerifySession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
