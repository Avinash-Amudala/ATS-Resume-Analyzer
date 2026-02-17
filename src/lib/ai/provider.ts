import { callGemini } from "./gemini";
import { callKimi } from "./kimi";
import { callGroq } from "./groq";
import { callOpenAI } from "./openai";

export type AIProvider = "gemini" | "openai" | "groq" | "kimi";

interface AIResult {
  text: string;
  tokensUsed: { prompt: number; completion: number };
  provider: AIProvider;
}

// Each provider function in priority order
const providers: { name: AIProvider; call: (s: string, u: string, m?: string) => Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> }[] = [
  { name: "gemini", call: callGemini },
  { name: "openai", call: callOpenAI },
  { name: "groq", call: callGroq },
  { name: "kimi", call: callKimi },
];

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { preferredProvider?: AIProvider; model?: string }
): Promise<AIResult> {
  const preferred = options?.preferredProvider || "gemini";

  // Reorder providers so preferred is first
  const orderedProviders = [
    ...providers.filter((p) => p.name === preferred),
    ...providers.filter((p) => p.name !== preferred),
  ];

  const errors: string[] = [];

  for (const provider of orderedProviders) {
    try {
      console.log(`Trying AI provider: ${provider.name}`);
      const result = await provider.call(systemPrompt, userPrompt, options?.model);
      console.log(`AI provider ${provider.name} succeeded (${result.tokensUsed.prompt + result.tokensUsed.completion} tokens)`);
      return { ...result, provider: provider.name };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`AI provider ${provider.name} failed: ${msg.slice(0, 500)}`);
      errors.push(`${provider.name}: ${msg.slice(0, 150)}`);
    }
  }

  throw new Error(
    `All AI providers failed. Errors: ${errors.join(" | ")}`
  );
}

export function parseAIJson<T>(text: string): T {
  // Step 1: Try direct parse first (handles clean JSON from JSON mode)
  try {
    return JSON.parse(text) as T;
  } catch {
    // Continue to cleanup
  }

  let cleaned = text.trim();

  // Step 2: Remove markdown code blocks if present (various formats)
  // Handle ```json, ```JSON, ```javascript, or bare ```
  cleaned = cleaned.replace(/^```(?:json|JSON|javascript|js)?\s*\n?/m, "");
  cleaned = cleaned.replace(/\n?```\s*$/m, "");
  cleaned = cleaned.trim();

  // Step 3: Try parsing after stripping code blocks
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue to extraction
  }

  // Step 4: Extract JSON object from surrounding text
  // Find the first { and the last matching }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate) as T;
    } catch {
      // Continue to final fallback
    }
  }

  // Step 5: Try to find JSON array
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const jsonCandidate = cleaned.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(jsonCandidate) as T;
    } catch {
      // Fall through to error
    }
  }

  // All parsing attempts failed
  throw new Error(
    `Failed to parse AI JSON response. First 200 chars: ${text.slice(0, 200)}`
  );
}

// Estimate cost based on tokens used
export function estimateCost(
  provider: AIProvider,
  tokens: { prompt: number; completion: number }
): number {
  if (provider === "gemini") {
    // Gemini 2.0 Flash pricing (per million tokens)
    return (tokens.prompt * 0.1 + tokens.completion * 0.4) / 1_000_000;
  }
  if (provider === "openai") {
    // GPT-4o-mini pricing (per million tokens)
    return (tokens.prompt * 0.15 + tokens.completion * 0.6) / 1_000_000;
  }
  if (provider === "groq") {
    // Groq Llama pricing (per million tokens)
    return (tokens.prompt * 0.05 + tokens.completion * 0.08) / 1_000_000;
  }
  // Kimi/Moonshot pricing (approximate)
  return (tokens.prompt * 0.12 + tokens.completion * 0.12) / 1_000_000;
}
