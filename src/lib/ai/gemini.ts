import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gemini-2.0-flash"
): Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  // Try different models as fallbacks within Gemini
  const models = [model, "gemini-1.5-flash", "gemini-1.5-flash-8b"];

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
