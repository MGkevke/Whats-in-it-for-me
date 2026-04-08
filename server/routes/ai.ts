import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function hasApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Please add it to your .env file."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function callClaude(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  try {
    const anthropic = getClient();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    return textBlock.text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API error (${error.status}): ${error.message}`
      );
    }
    throw error;
  }
}

export function isAiAvailable(): boolean {
  return hasApiKey();
}
