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

    let missingKeywords: string[] = [];
    try {
      missingKeywords = scan.missingKeywords
        ? JSON.parse(scan.missingKeywords).map(
            (k: { keyword: string }) => k.keyword
          )
        : [];
    } catch (parseErr) {
      console.warn("Failed to parse missingKeywords, using empty array:", parseErr);
      missingKeywords = [];
    }

    const userPrompt = buildOptimizationUserPrompt(
      scan.resume.rawText,
      scan.jdText,
      missingKeywords
    );

    console.log(`Starting optimization for scan ${scanId}, resume length: ${scan.resume.rawText.length}, JD length: ${scan.jdText.length}, missing keywords: ${missingKeywords.length}`);

    // Call AI provider (tries all configured providers with fallback)
    let aiResult;
    try {
      aiResult = await callAI(RESUME_OPTIMIZATION_PROMPT, userPrompt);
    } catch (aiError) {
      const msg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error("All AI providers failed for optimization:", msg);
      return NextResponse.json(
        { error: "All AI services are currently unavailable. Please try again in a few minutes." },
        { status: 503 }
      );
    }

    // Parse the AI response into structured JSON
    let optimized: OptimizationResult;
    try {
      const parsed = parseAIJson<Omit<OptimizationResult, "modelUsed" | "tokensUsed">>(aiResult.text);
      optimized = {
        ...parsed,
        modelUsed: aiResult.provider,
        tokensUsed: aiResult.tokensUsed,
      };
    } catch (jsonError) {
      const msg = jsonError instanceof Error ? jsonError.message : String(jsonError);
      console.error(`AI JSON parse failed (provider: ${aiResult.provider}):`, msg);
      console.error("Raw AI response (first 500 chars):", aiResult.text.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned an invalid response format. Please try again." },
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

    console.log(`Optimization complete: scan=${scanId}, provider=${aiResult.provider}, cost=$${cost.toFixed(6)}`);

    return NextResponse.json({
      success: true,
      data: {
        optimizationId: optimization.id,
        optimized,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Optimization error:", msg);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "AI optimization failed. Please try again in a few minutes." },
      { status: 500 }
    );
  }
}
