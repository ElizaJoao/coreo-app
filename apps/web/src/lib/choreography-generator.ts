import Anthropic from "@anthropic-ai/sdk";

import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";

const client = new Anthropic();

type GenerateInput = {
  style: string;
  duration: number;
  difficulty: string;
  targetAudience: string;
  description: string;
};

type GeneratedChoreography = {
  name: string;
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
};

const generateTool: Anthropic.Tool = {
  name: "create_choreography",
  description: "Create a structured choreography plan based on the given parameters.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description: "A creative, descriptive name for the choreography.",
      },
      moves: {
        type: "array",
        description: "Ordered list of choreography moves.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique identifier (e.g. 'move-1')" },
            order: { type: "number", description: "1-based position in the sequence" },
            name: { type: "string", description: "Name of the move" },
            duration: { type: "number", description: "Duration in seconds" },
            description: { type: "string", description: "Cue or instruction for the instructor" },
          },
          required: ["id", "order", "name", "duration", "description"],
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

export async function generateChoreography(
  input: GenerateInput,
): Promise<GeneratedChoreography> {
  const durationSec = input.duration * 60;
  const prompt = `You are an expert fitness and dance choreographer.

Create a complete choreography plan for a ${input.style} class:
- Duration: ${input.duration} minutes (${durationSec} seconds total)
- Difficulty: ${input.difficulty}
- Target audience: ${input.targetAudience}
${input.description ? `- Notes from instructor: ${input.description}` : ""}

Design 8–14 moves that fit the total duration. Each move should have a realistic duration in seconds so they sum to approximately ${durationSec}s. Include a warm-up and cool-down. Suggest fitting music.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    tools: [generateTool],
    tool_choice: { type: "tool", name: "create_choreography" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a choreography.");
  }

  const result = toolUse.input as GeneratedChoreography;
  return result;
}
