const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  model: string = "llama-3.3-70b-versatile"
): Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured - GROQ_API_KEY env var is missing");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error.slice(0, 200)}`);
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
