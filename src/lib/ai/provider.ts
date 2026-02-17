import { callGemini } from "./gemini";
import { callKimi } from "./kimi";
import { callGroq } from "./groq";

export type AIProvider = "gemini" | "kimi" | "groq";

interface AIResult {
  text: string;
  tokensUsed: { prompt: number; completion: number };
  provider: AIProvider;
}

// Each provider function in priority order
const providers: { name: AIProvider; call: (s: string, u: string, m?: string) => Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> }[] = [
  { name: "gemini", call: callGemini },
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
      const result = await provider.call(systemPrompt, userPrompt, options?.model);
      return { ...result, provider: provider.name };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`AI provider ${provider.name} failed: ${msg.slice(0, 300)}`);
      errors.push(`${provider.name}: ${msg.slice(0, 100)}`);
    }
  }

  throw new Error(
    `All AI providers failed. Errors: ${errors.join(" | ")}`
  );
}

export function parseAIJson<T>(text: string): T {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
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
  if (provider === "groq") {
    // Groq Llama pricing (per million tokens)
    return (tokens.prompt * 0.05 + tokens.completion * 0.08) / 1_000_000;
  }
  // Kimi/Moonshot pricing (approximate)
  return (tokens.prompt * 0.12 + tokens.completion * 0.12) / 1_000_000;
}
