import fs from "fs";
import path from "path";

let cached: string | null = null;

export function getSystemPrompt(): string {
  if (cached === null) {
    const filePath = path.join(process.cwd(), "system_prompt.md");
    cached = fs.readFileSync(filePath, "utf-8");
  }
  return cached;
}
