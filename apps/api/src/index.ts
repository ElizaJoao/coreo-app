import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  type Choreography,
  ChoreographySchema,
  GenerateChoreographyRequestSchema,
  type User,
  UserSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
  UpdateChoreographyRequestSchema
} from "@coreo/shared";

const app = express();
app.use(cors());
app.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.header("stripe-signature") ?? "";
    if (!stripeWebhookSecret) return res.status(500).send("Webhook secret not configured");
    if (!sig) return res.status(400).send("Missing stripe-signature");

    const rawBody = req.body as Buffer;
    const event = verifyStripeWebhook(rawBody, sig, stripeWebhookSecret);
    await handleStripeEvent(event);
    res.json({ received: true });
  } catch (e) {
    res.status(400).send(e instanceof Error ? e.message : "Webhook error");
  }
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const dataDir = path.join(process.cwd(), "data");
const choreosPath = path.join(dataDir, "choreographies.json");
const usersPath = path.join(dataDir, "users.json");

type StoredUser = User & { passwordHash: string };

const jwtSecret = process.env.JWT_SECRET ?? "dev-insecure-secret";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const webBaseUrl = process.env.WEB_BASE_URL ?? "http://localhost:3000";
if (jwtSecret === "dev-insecure-secret") {
  console.warn(
    "WARNING: JWT_SECRET is not set. Using a development-only insecure default. Set JWT_SECRET before production use."
  );
}
if (!stripeSecretKey) {
  console.warn(
    "WARNING: STRIPE_SECRET_KEY is not set. Billing endpoints will not work until set."
  );
}
if (!stripeWebhookSecret) {
  console.warn(
    "WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook verification will not work until set."
  );
}

async function ensureDataFile(filePath: string) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({ items: [] }, null, 2), "utf8");
  }
}

async function readAll(): Promise<Choreography[]> {
  await ensureDataFile(choreosPath);
  const raw = await fs.readFile(choreosPath, "utf8");
  const parsed = JSON.parse(raw) as { items?: unknown };
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const result: Choreography[] = [];
  for (const item of items) {
    const maybe = ChoreographySchema.safeParse(item);
    if (maybe.success) result.push(maybe.data);
  }
  return result;
}

async function writeAll(items: Choreography[]) {
  await ensureDataFile(choreosPath);
  await fs.writeFile(choreosPath, JSON.stringify({ items }, null, 2), "utf8");
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureDataFile(usersPath);
  const raw = await fs.readFile(usersPath, "utf8");
  const parsed = JSON.parse(raw) as { items?: unknown };
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const result: StoredUser[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const maybeUser = UserSchema.safeParse(item);
    if (!maybeUser.success) continue;
    const passwordHash =
      typeof (item as any).passwordHash === "string" ? (item as any).passwordHash : "";
    if (!passwordHash) continue;
    result.push({ ...maybeUser.data, passwordHash });
  }
  return result;
}

async function writeUsers(items: StoredUser[]) {
  await ensureDataFile(usersPath);
  await fs.writeFile(usersPath, JSON.stringify({ items }, null, 2), "utf8");
}

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "30d" });
}

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!jwtSecret) return res.status(500).json({ error: "Server auth not configured" });
    const decoded = jwt.verify(token, jwtSecret) as { sub?: string };
    const userId = decoded.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token" });
    (req as any).userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function timingSafeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type StripeEvent = {
  id: string;
  type: string;
  data: { object: any };
};

function verifyStripeWebhook(rawBody: Buffer, signatureHeader: string, secret: string): StripeEvent {
  const parts = signatureHeader.split(",").map((p) => p.trim());
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !v1) throw new Error("Invalid stripe-signature header");

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  if (!timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"))) {
    throw new Error("Invalid signature");
  }

  const t = Number(timestamp);
  if (!Number.isFinite(t)) throw new Error("Invalid timestamp");
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - t) > 5 * 60) throw new Error("Timestamp outside tolerance");

  return JSON.parse(rawBody.toString("utf8")) as StripeEvent;
}

async function stripePost<T>(apiPath: string, params: Record<string, any>): Promise<T> {
  if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  const body = new URLSearchParams();

  function add(prefix: string, value: any) {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => add(`${prefix}[${i}]`, v));
      return;
    }
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) add(`${prefix}[${k}]`, v);
      return;
    }
    body.append(prefix, String(value));
  }

  for (const [k, v] of Object.entries(params)) add(k, v);

  const res = await fetch(`https://api.stripe.com/v1${apiPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Stripe error (${res.status}): ${txt}`);
  }
  return (await res.json()) as T;
}

function priceIdForPlan(plan: "basic" | "pro") {
  const key = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BASIC;
  if (!key) throw new Error(`Missing Stripe price env for ${plan}`);
  return key;
}

async function handleStripeEvent(event: StripeEvent) {
  if (event.type !== "checkout.session.completed") return;
  const session = event.data.object;
  const userId = session?.metadata?.userId as string | undefined;
  const plan = session?.metadata?.plan as "basic" | "pro" | undefined;
  if (!userId) return;

  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;

  users[idx] = {
    ...users[idx],
    subscription: {
      status: "active",
      plan: plan ?? users[idx].subscription?.plan,
      currentPeriodEnd: users[idx].subscription?.currentPeriodEnd
    }
  };
  await writeUsers(users);
}

app.post("/auth/register", async (req, res) => {
  const parsed = RegisterRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const users = await readUsers();
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user: User = {
    id: nanoid(),
    email,
    createdAt: now,
    subscription: { status: "none" }
  };

  users.unshift({ ...user, passwordHash });
  await writeUsers(users);

  const token = signToken(user.id);
  res.status(201).json({ token, user });
});

app.post("/auth/login", async (req, res) => {
  const parsed = LoginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const users = await readUsers();
  const found = users.find((u) => u.email === email);
  if (!found) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, found.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(found.id);
  const { passwordHash, ...user } = found;
  res.json({ token, user });
});

app.get("/me", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const users = await readUsers();
  const found = users.find((u) => u.id === userId);
  if (!found) return res.status(404).json({ error: "Not found" });
  const { passwordHash, ...user } = found;
  res.json({ user });
});

app.post("/billing/create-checkout-session", authRequired, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const plan = req.body?.plan === "pro" ? "pro" : "basic";

    const users = await readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) return res.status(404).json({ error: "User not found" });
    const user = users[idx];

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripePost<{ id: string }>("/customers", {
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;
      users[idx] = { ...user, stripeCustomerId: customerId };
      await writeUsers(users);
    }

    const session = await stripePost<{ id: string; url?: string }>("/checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      success_url: `${webBaseUrl}/billing/success`,
      cancel_url: `${webBaseUrl}/billing/cancel`,
      line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
      metadata: { userId, plan }
    });

    res.json({ id: session.id, url: session.url });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Billing error" });
  }
});

function generateTimeline(style: string, level: string, durationMinutes: number) {
  const blocks = Math.max(3, Math.min(10, Math.round(durationMinutes / 6)));
  const baseMoves =
    style.toLowerCase().includes("hiit")
      ? ["Jumping jacks", "Squat pulses", "Mountain climbers", "Burpees", "High knees"]
      : style.toLowerCase().includes("yoga") || style.toLowerCase().includes("pilates")
        ? ["Breath + posture", "Flow sequence", "Hold + control", "Transition", "Cool down"]
        : ["Step touch", "Grapevine", "V-step", "Mambo", "Turn + pose"];

  const intensity =
    level === "advanced" ? "Fast" : level === "intermediate" ? "Moderate" : "Easy";

  return Array.from({ length: blocks }).map((_, i) => ({
    name: baseMoves[i % baseMoves.length],
    counts: i === 0 ? "8x8" : "4x8",
    cue: `${intensity} focus — clean transitions`
  }));
}

app.get("/choreographies", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const items = await readAll();
  const mine = items.filter((c: any) => c.ownerId === userId);
  res.json({ items: mine });
});

app.get("/choreographies/:id", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const items = await readAll();
  const found = items.find((c: any) => c.id === req.params.id && c.ownerId === userId);
  if (!found) return res.status(404).json({ error: "Not found" });
  res.json(found);
});

app.post("/choreographies/generate", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const parsed = GenerateChoreographyRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const now = new Date().toISOString();
  const bpm =
    parsed.data.style.toLowerCase().includes("hiit")
      ? 150
      : parsed.data.style.toLowerCase().includes("tango")
        ? 128
        : parsed.data.style.toLowerCase().includes("salsa")
          ? 160
          : parsed.data.style.toLowerCase().includes("yoga") ||
              parsed.data.style.toLowerCase().includes("pilates")
            ? 90
            : 132;

  const choreo: Choreography & { ownerId: string } = {
    id: nanoid(),
    name: `${parsed.data.style} — ${parsed.data.level} (${parsed.data.durationMinutes}min)`,
    style: parsed.data.style,
    level: parsed.data.level,
    audience: parsed.data.audience,
    durationMinutes: parsed.data.durationMinutes,
    bpm,
    timeline: generateTimeline(parsed.data.style, parsed.data.level, parsed.data.durationMinutes),
    createdAt: now,
    updatedAt: now,
    ownerId: userId
  };

  const items = await readAll();
  (items as any).unshift(choreo);
  await writeAll(items);

  res.status(201).json(choreo);
});

app.patch("/choreographies/:id", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const parsed = UpdateChoreographyRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const items = await readAll();
  const idx = items.findIndex((c: any) => c.id === req.params.id && c.ownerId === userId);
  if (idx < 0) return res.status(404).json({ error: "Not found" });

  const existing = items[idx];
  const updated: any = {
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };

  // Validate core fields; allow ownerId passthrough.
  const validated = ChoreographySchema.safeParse(updated);
  if (!validated.success) {
    return res.status(400).json({
      error: "Invalid choreo after update",
      details: validated.error.flatten()
    });
  }
  items[idx] = { ...validated.data, ownerId: existing.ownerId } as any;
  await writeAll(items);
  res.json(items[idx]);
});

app.delete("/choreographies/:id", authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const items = await readAll();
  const next = (items as any).filter((c: any) => !(c.id === req.params.id && c.ownerId === userId));
  if (next.length === items.length) return res.status(404).json({ error: "Not found" });
  await writeAll(next);
  res.status(204).send();
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
