const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-4o-mini"
): Promise<{ text: string; tokensUsed: { prompt: number; completion: number } }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error.slice(0, 200)}`);
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
