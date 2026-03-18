import { z } from "zod";

export const ChoreoStyleSchema = z.string().min(2).max(50);
export type ChoreoStyle = z.infer<typeof ChoreoStyleSchema>;

export const GenerateChoreographyRequestSchema = z.object({
  style: ChoreoStyleSchema,
  durationMinutes: z.number().int().min(5).max(90),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  audience: z.enum(["kids", "adults", "mixed"]),
  notes: z.string().max(500).optional().default("")
});
export type GenerateChoreographyRequest = z.infer<
  typeof GenerateChoreographyRequestSchema
>;

export const ChoreographyMoveSchema = z.object({
  name: z.string().min(1).max(80),
  counts: z.string().min(1).max(30),
  cue: z.string().max(120).optional().default("")
});
export type ChoreographyMove = z.infer<typeof ChoreographyMoveSchema>;

export const ChoreographySchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  name: z.string().min(1).max(80),
  style: ChoreoStyleSchema,
  level: z.enum(["beginner", "intermediate", "advanced"]),
  audience: z.enum(["kids", "adults", "mixed"]),
  durationMinutes: z.number().int().min(5).max(90),
  bpm: z.number().int().min(60).max(220),
  song: z
    .object({
      title: z.string().max(120).optional(),
      artist: z.string().max(120).optional()
    })
    .optional(),
  timeline: z.array(ChoreographyMoveSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type Choreography = z.infer<typeof ChoreographySchema>;

export const UpdateChoreographyRequestSchema = ChoreographySchema.pick({
  name: true,
  bpm: true,
  song: true,
  timeline: true
}).partial();
export type UpdateChoreographyRequest = z.infer<
  typeof UpdateChoreographyRequestSchema
>;

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string(),
  stripeCustomerId: z.string().optional(),
  subscription: z
    .object({
      status: z.enum(["none", "trialing", "active", "past_due", "canceled"]),
      plan: z.enum(["basic", "pro"]).optional(),
      currentPeriodEnd: z.string().optional()
    })
    .default({ status: "none" })
});
export type User = z.infer<typeof UserSchema>;

export const AuthTokenSchema = z.object({
  token: z.string().min(10)
});
export type AuthToken = z.infer<typeof AuthTokenSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128)
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  token: z.string().min(10),
  user: UserSchema
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const SubscriptionStatusSchema = UserSchema.shape.subscription;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
