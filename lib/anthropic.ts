import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_MODEL = "claude-sonnet-5";
export const MODEL_ID = process.env.CLAUDE_MODEL_ID || DEFAULT_MODEL;

let client: Anthropic | null = null;

// Lazily constructed so that importing this module never throws when
// ANTHROPIC_API_KEY is missing — the API route checks for the key first and
// returns a friendly error before ever calling this. Reads the key from
// process.env automatically; never pass it from the client, never log it.
export function getAnthropicClient(): Anthropic {
  if (client === null) {
    client = new Anthropic();
  }
  return client;
}
