import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gemini-2.5-flash"
): Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  // Gemini 2.5 Flash (paid tier) as primary, with 2.0 fallback
  // Note: 1.5 models are deprecated — only use 2.x series
  const models = [model, "gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const modelName of models) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const geminiModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await geminiModel.generateContent(userPrompt);
        const response = result.response;
        const text = response.text();

        const usage = response.usageMetadata;
        console.log(`Gemini success: model=${modelName}, prompt=${usage?.promptTokenCount ?? 0}, completion=${usage?.candidatesTokenCount ?? 0}`);
        return {
          text,
          tokensUsed: {
            prompt: usage?.promptTokenCount ?? 0,
            completion: usage?.candidatesTokenCount ?? 0,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMsg = lastError.message;

        // If rate limited (429), wait and retry with backoff
        if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          const waitTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
          console.warn(`Gemini rate limited (${modelName}, attempt ${attempt + 1}/${maxRetries}). Waiting ${waitTime / 1000}s...`);
          await sleep(waitTime);
          continue;
        }

        // For non-rate-limit errors, try next model
        console.warn(`Gemini model ${modelName} error: ${errorMsg.slice(0, 200)}`);
        break;
      }
    }
  }

  throw lastError || new Error("Gemini API failed after all retries");
}
