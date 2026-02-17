import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, canPerformFreeAction, incrementOptimizeCount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callAI, parseAIJson, estimateCost } from "@/lib/ai/provider";
import {
  RESUME_OPTIMIZATION_PROMPT,
  buildOptimizationUserPrompt,
} from "@/lib/ai/prompts";
import type { OptimizationResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check freemium limit (3 free optimizations/day)
    const usage = canPerformFreeAction(user, "optimize");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "You've used all 3 free AI optimizations today. Upgrade to Pro for unlimited optimizations.",
          upgradeRequired: true,
          usage: {
            used: usage.used,
            limit: usage.limit,
            action: "optimize",
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { scanId } = body;

    if (!scanId) {
      return NextResponse.json(
        { error: "Scan ID is required." },
        { status: 400 }
      );
    }

    const scan = await prisma.scan.findFirst({
      where: { id: scanId, userId: user.id },
      include: { resume: true },
    });

    if (!scan || !scan.resume?.rawText) {
      return NextResponse.json({ error: "Scan not found." }, { status: 404 });
    }

    const missingKeywords = scan.missingKeywords
      ? JSON.parse(scan.missingKeywords).map(
          (k: { keyword: string }) => k.keyword
        )
      : [];

    const userPrompt = buildOptimizationUserPrompt(
      scan.resume.rawText,
      scan.jdText,
      missingKeywords
    );

    const aiResult = await callAI(RESUME_OPTIMIZATION_PROMPT, userPrompt);

    let optimized: OptimizationResult;
    try {
      const parsed = parseAIJson<Omit<OptimizationResult, "modelUsed" | "tokensUsed">>(aiResult.text);
      optimized = {
        ...parsed,
        modelUsed: aiResult.provider,
        tokensUsed: aiResult.tokensUsed,
      };
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid response. Please try again." },
        { status: 502 }
      );
    }

    const cost = estimateCost(aiResult.provider, aiResult.tokensUsed);

    // Save optimization
    const optimization = await prisma.optimization.create({
      data: {
        scanId: scan.id,
        aiModelUsed: aiResult.provider,
        promptTokens: aiResult.tokensUsed.prompt,
        completionTokens: aiResult.tokensUsed.completion,
        costUsd: cost,
        originalSections: scan.resume.parsedJson,
        optimizedSections: JSON.stringify(optimized),
      },
    });

    // Update resume with optimized version
    await prisma.resume.update({
      where: { id: scan.resumeId },
      data: { optimizedJson: JSON.stringify(optimized) },
    });

    // Increment optimize count
    await incrementOptimizeCount(user.id);

    return NextResponse.json({
      success: true,
      data: {
        optimizationId: optimization.id,
        optimized,
      },
    });
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { error: "AI optimization failed. Please try again in a few minutes." },
      { status: 500 }
    );
  }
}
