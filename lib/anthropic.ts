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

// Haiku models reject output_config.effort outright (400 "This model does
// not support the effort parameter"). Only Sonnet/Opus-tier models accept it.
export function modelSupportsEffort(model: string): boolean {
  return !model.toLowerCase().includes("haiku");
}
