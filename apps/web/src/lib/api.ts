import type {
  Choreography,
  GenerateChoreographyRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UpdateChoreographyRequest
} from "@coreo/shared";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listChoreographies(): Promise<Choreography[]> {
  const res = await fetch(`${API_BASE}/choreographies`, {
    cache: "no-store",
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error(`Failed to list choreographies (${res.status})`);
  const data = (await res.json()) as { items: Choreography[] };
  return data.items ?? [];
}

export async function generateChoreography(
  req: GenerateChoreographyRequest
): Promise<Choreography> {
  const res = await fetch(`${API_BASE}/choreographies/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error(`Failed to generate (${res.status})`);
  return (await res.json()) as Choreography;
}

export async function updateChoreography(
  id: string,
  patch: UpdateChoreographyRequest
): Promise<Choreography> {
  const res = await fetch(`${API_BASE}/choreographies/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(`Failed to update (${res.status})`);
  return (await res.json()) as Choreography;
}

export async function deleteChoreography(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/choreographies/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error(`Failed to register (${res.status})`);
  return (await res.json()) as AuthResponse;
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error(`Failed to login (${res.status})`);
  return (await res.json()) as AuthResponse;
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Failed to load user (${res.status})`);
  const data = (await res.json()) as { user: User };
  return data.user;
}

export async function createCheckoutSession(plan: "basic" | "pro"): Promise<{ url?: string }> {
  const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ plan })
  });
  if (!res.ok) throw new Error(`Failed to create checkout session (${res.status})`);
  return (await res.json()) as { url?: string };
}

