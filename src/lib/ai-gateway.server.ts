import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Agents run on Google Gemini directly, using the project's own GEMINI_API_KEY.
// Google exposes an OpenAI-compatible endpoint, so the AI SDK talks to it unchanged.
export const AI_MODEL = "gemini-3.7-flash";

// Cheapest Gemini tier that reliably handles the agents' routine weekly work
// (research notes, short reviews, keyword upkeep). Used by the weekly cycle job
// to keep recurring cost low; interactive chat stays on AI_MODEL.
export const CHEAP_MODEL = "gemini-3.5-flash-lite";

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey,
  });
}

export function gatewayModel() {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured yet — add a GEMINI_API_KEY.");
  return createGeminiProvider(key)(AI_MODEL);
}

export function aiErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("401") || msg.includes("403")) return "The Gemini API key was rejected. Check the key and try again.";
  if (msg.includes("429")) return "Gemini is rate-limiting requests right now — try again in a moment.";
  if (msg.includes("quota")) return "This Gemini key has run out of quota.";
  return msg || "The agent could not be reached.";
}
