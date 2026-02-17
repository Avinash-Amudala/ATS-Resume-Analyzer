const KIMI_BASE_URL = process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1";
const KIMI_API_KEY = process.env.KIMI_API_KEY || "";

export async function callKimi(
  systemPrompt: string,
  userPrompt: string,
  model: string = "moonshot-v1-8k"
): Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> {
  if (!KIMI_API_KEY) {
    throw new Error("Kimi API key not configured");
  }

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${response.status} ${error.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    text,
    tokensUsed: {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
    },
  };
}
