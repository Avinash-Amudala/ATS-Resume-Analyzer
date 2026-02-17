import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, canPerformFreeAction, incrementOptimizeCount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callAI, parseAIJson, estimateCost } from "@/lib/ai/provider";
import {
  RESUME_OPTIMIZATION_PROMPT,
  buildOptimizationUserPrompt,
} from "@/lib/ai/prompts";
import { parseStructuredResume } from "@/lib/resume/structured";
import { runATSScoring } from "@/lib/scoring";
import type { OptimizationResult, StructuredResume } from "@/types";

/**
 * Merge OptimizationResult into StructuredResume for re-scoring.
 */
function mergeForScoring(
  original: StructuredResume,
  optimized: OptimizationResult
): StructuredResume {
  const merged = { ...original };

  if (optimized.summary) {
    merged.summary = optimized.summary;
  }

  if (Array.isArray(optimized.experience)) {
    merged.experience = (merged.experience || []).map((exp) => {
      const opt = optimized.experience.find((o) => o.company === exp.company);
      if (opt?.bulletsRewritten?.length) {
        return { ...exp, bullets: opt.bulletsRewritten };
      }
      return exp;
    });
  }

  if (optimized.skills?.categoriesRewritten?.length) {
    merged.skills = optimized.skills.categoriesRewritten;
  }

  return merged;
}

/**
 * Re-build the resume text from structured data for scoring.
 */
function structuredToText(resume: StructuredResume): string {
  const parts: string[] = [];

  // Contact
  if (resume.contact?.name) parts.push(resume.contact.name);
  if (resume.contact?.email) parts.push(resume.contact.email);
  if (resume.contact?.phone) parts.push(resume.contact.phone);
  if (resume.contact?.linkedin) parts.push(resume.contact.linkedin);
  if (resume.contact?.portfolio) parts.push(resume.contact.portfolio);
  if (resume.contact?.location) parts.push(resume.contact.location);
  parts.push("");

  // Summary
  if (resume.summary) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(resume.summary);
    parts.push("");
  }

  // Experience
  if (resume.experience?.length) {
    parts.push("EXPERIENCE");
    for (const exp of resume.experience) {
      parts.push(`${exp.company} | ${exp.title} | ${exp.startDate} - ${exp.endDate}`);
      for (const bullet of exp.bullets) {
        parts.push(`• ${bullet.replace(/^[•\-●]\s*/, "")}`);
      }
      parts.push("");
    }
  }

  // Education
  if (resume.education?.length) {
    parts.push("EDUCATION");
    for (const edu of resume.education) {
      parts.push(`${edu.institution} | ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} | ${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`);
    }
    parts.push("");
  }

  // Skills
  if (resume.skills?.length) {
    parts.push("SKILLS");
    parts.push(resume.skills.join(", "));
    parts.push("");
  }

  // Projects
  if (resume.projects?.length) {
    parts.push("PROJECTS");
    for (const proj of resume.projects) {
      parts.push(proj.name);
      for (const bullet of proj.bullets) {
        parts.push(`• ${bullet.replace(/^[•\-●]\s*/, "")}`);
      }
      parts.push("");
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    parts.push("CERTIFICATIONS");
    for (const cert of resume.certifications) {
      parts.push(`• ${cert}`);
    }
  }

  return parts.join("\n");
}

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

    // Re-score the optimized resume to give user the new ATS score
    let newScore: number | undefined;
    try {
      const originalParsed = scan.resume.parsedJson
        ? (JSON.parse(scan.resume.parsedJson) as StructuredResume)
        : parseStructuredResume(scan.resume.rawText);

      const mergedResume = mergeForScoring(originalParsed, optimized);
      const optimizedText = structuredToText(mergedResume);

      // Create a simple buffer for file format check (use original)
      const fakeBuffer = Buffer.from(optimizedText, "utf-8");

      const scoreResult = runATSScoring({
        resumeText: optimizedText,
        jdText: scan.jdText,
        fileBuffer: fakeBuffer,
        fileName: "resume.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      newScore = scoreResult.totalScore;
    } catch (scoreError) {
      console.error("Re-scoring error (non-fatal):", scoreError);
      // Non-fatal - optimization still succeeds without score
    }

    return NextResponse.json({
      success: true,
      data: {
        optimizationId: optimization.id,
        optimized,
        newScore,
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
