import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { supabase } from "./supabase";

const scryptAsync = promisify(scrypt);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  plan: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  plan: string;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuffer, derived);
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const { data } = await supabase
    .from("users")
    .select("id, email, name, plan")
    .eq("email", email.toLowerCase())
    .single();

  return data as AuthUser | null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  return createUserFromHash({ email: normalizedEmail, name: input.name.trim(), passwordHash });
}

export async function createUserFromHash(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<AuthUser> {
  const { data, error } = await supabase
    .from("users")
    .insert({ email: input.email, name: input.name, password_hash: input.passwordHash })
    .select("id, email, name, plan")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("User already exists.");
    throw new Error(error.message);
  }

  return data as AuthUser;
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const { data } = await supabase
    .from("users")
    .select("id, email, name, password_hash")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (!data) return null;

  const row = data as UserRow;
  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return null;

  return { id: row.id, email: row.email, name: row.name, plan: row.plan ?? "free" };
}
