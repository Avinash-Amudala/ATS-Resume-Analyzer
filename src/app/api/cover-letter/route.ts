import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callAI, parseAIJson } from "@/lib/ai/provider";
import { COVER_LETTER_PROMPT, buildCoverLetterUserPrompt } from "@/lib/ai/prompts";
import { isPro } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPro(user.plan)) {
      return NextResponse.json(
        { error: "Cover letter generation is a Pro feature." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { resumeId, jdText, tone = "professional" } = body;

    if (!resumeId || !jdText) {
      return NextResponse.json(
        { error: "Resume ID and job description are required." },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume?.rawText) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const userPrompt = buildCoverLetterUserPrompt(resume.rawText, jdText, tone);
    const aiResult = await callAI(COVER_LETTER_PROMPT, userPrompt);

    let parsed: { content: string; wordCount: number };
    try {
      parsed = parseAIJson(aiResult.text);
    } catch {
      // If JSON parsing fails, use the raw text as cover letter content
      parsed = { content: aiResult.text, wordCount: aiResult.text.split(/\s+/).length };
    }

    return NextResponse.json({
      success: true,
      data: {
        content: parsed.content,
        wordCount: parsed.wordCount,
        tone,
        provider: aiResult.provider,
      },
    });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter." },
      { status: 500 }
    );
  }
}
