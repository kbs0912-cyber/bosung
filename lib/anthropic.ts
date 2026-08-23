import Anthropic from "@anthropic-ai/sdk";
import { getApiKey, getModelId } from "@/lib/config";

// A new client is created per call (cheap) rather than cached, so a key
// saved from the in-app 설정 screen takes effect immediately without
// restarting the server.
export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: getApiKey() });
}

export function getModel(): string {
  return getModelId();
}
