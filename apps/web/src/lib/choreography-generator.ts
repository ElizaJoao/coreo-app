import Anthropic from "@anthropic-ai/sdk";

import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import type { Plan } from "../constants/plans";

const client = new Anthropic();

type GenerateInput = {
  style: string;
  duration: number;
  difficulty: string;
  targetAudience: string;
  description: string;
  plan?: Plan;
};

type GeneratedChoreography = {
  name: string;
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
};

function buildTool(plan: Plan): Anthropic.Tool {
  const moveProperties: Record<string, unknown> = {
    id: { type: "string", description: "Unique identifier (e.g. 'move-1')" },
    order: { type: "number", description: "1-based position in the sequence" },
    name: { type: "string", description: "Name of the move" },
    duration: { type: "number", description: "Duration in seconds" },
    description: { type: "string", description: "Detailed cue or instruction for the instructor" },
  };

  const required = ["id", "order", "name", "duration", "description"];

  if (plan === "pro" || plan === "max") {
    moveProperties.videoQuery = {
      type: "string",
      description: "Short YouTube search query to find a demo video of this move (e.g. 'zumba salsa step tutorial', 'hip hop body roll beginner')",
    };
    required.push("videoQuery");
  }

  if (plan === "max") {
    moveProperties.verbalCue = {
      type: "string",
      description: "Exact words the instructor says to the class during this move (1-2 sentences of coaching language, e.g. 'Step right, arms sweep up! Feel the rhythm, stay with the beat!')",
    };
    required.push("verbalCue");
  }

  return {
    name: "create_choreography",
    description: "Create a structured choreography plan based on the given parameters.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "A creative, descriptive name for the choreography." },
        moves: {
          type: "array",
          description: "Ordered list of choreography moves.",
          items: {
            type: "object",
            properties: moveProperties,
            required,
          },
        },
        music: {
          type: "object",
          description: "Optional music suggestion.",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
            bpm: { type: "number" },
          },
          required: ["title", "artist", "bpm"],
        },
      },
      required: ["name", "moves"],
    },
  };
}

function buildPrompt(input: GenerateInput): string {
  const { style, duration, difficulty, targetAudience, description, plan = "free" } = input;
  const durationSec = duration * 60;

  const base = `You are an expert fitness and dance choreographer.

Create a complete choreography plan for a ${style} class:
- Duration: ${duration} minutes (${durationSec} seconds total)
- Difficulty: ${difficulty}
- Target audience: ${targetAudience}
${description ? `- Notes from instructor: ${description}` : ""}

Design 8–14 moves that fit the total duration. Each move should have a realistic duration in seconds so they sum to approximately ${durationSec}s. Include a warm-up and cool-down. Suggest fitting music.`;

  if (plan === "pro") {
    return `${base}

For each move, include a concise YouTube search query that would help instructors or students find a demo video of the exact movement. Keep search queries short and specific (e.g. "zumba merengue step tutorial" or "hip hop wave arms beginner").`;
  }

  if (plan === "max") {
    return `${base}

For each move, include:
1. A YouTube search query for a demo video (short and specific)
2. Verbal cues — the exact energetic phrases the instructor says out loud to guide the class during that move. Keep them natural, motivating, and rhythmic (1-2 sentences).`;
  }

  return base;
}

export async function generateChoreography(
  input: GenerateInput,
): Promise<GeneratedChoreography> {
  const plan = input.plan ?? "free";
  const tool = buildTool(plan);
  const prompt = buildPrompt(input);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: plan === "free" ? 2048 : 4096,
    tools: [tool],
    tool_choice: { type: "tool", name: "create_choreography" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a choreography.");
  }

  return toolUse.input as GeneratedChoreography;
}
