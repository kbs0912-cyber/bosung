import fs from "fs";
import path from "path";

export interface AppConfig {
  apiKey?: string;
  modelId?: string;
}

// In the packaged Windows (Electron) app, main.js sets APP_CONFIG_DIR to the
// OS user-data folder (e.g. %APPDATA%/AI 딸깍 블로그) so settings survive
// app updates and reinstalls. In a normal Next.js deployment this is unset
// and falls back to the project root, matching plain env-var usage.
function getConfigDir(): string {
  return process.env.APP_CONFIG_DIR || process.cwd();
}

function getConfigPath(): string {
  return path.join(getConfigDir(), "ai-ddalkkak-config.json");
}

export function readConfig(): AppConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : undefined,
      modelId: typeof parsed.modelId === "string" ? parsed.modelId : undefined,
    };
  } catch {
    return {};
  }
}

export function writeConfig(config: AppConfig): void {
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
}

export const DEFAULT_MODEL = "claude-sonnet-5";

// Env var always wins (normal server deployment). Falls back to the value
// saved from the in-app 설정 screen, used by the packaged desktop app.
export function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || readConfig().apiKey;
}

export function getModelId(): string {
  return process.env.CLAUDE_MODEL_ID || readConfig().modelId || DEFAULT_MODEL;
}

// Settings saved via the API are only allowed when no ANTHROPIC_API_KEY env
// var is already set — otherwise an admin-configured deployment key could be
// silently overridden by whoever has the app open.
export function isApiKeyManagedByEnv(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
