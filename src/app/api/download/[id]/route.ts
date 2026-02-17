import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, canPerformFreeAction, incrementDownloadCount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateDocx } from "@/lib/resume/generator";
import type { StructuredResume } from "@/types";

/**
 * Merge AI OptimizationResult into a StructuredResume for DOCX generation.
 * The AI returns { summary, experience[].bulletsRewritten, skills.categoriesRewritten }
 * but generateDocx expects a full StructuredResume shape.
 */
function mergeOptimization(
  original: StructuredResume,
  optimized: Record<string, unknown>
): StructuredResume {
  const merged = { ...original };

  if (typeof optimized.summary === "string" && optimized.summary) {
    merged.summary = optimized.summary;
  }

  if (Array.isArray(optimized.experience)) {
    merged.experience = (merged.experience || []).map((exp) => {
      const opt = (optimized.experience as Array<{ company: string; bulletsRewritten?: string[] }>)
        .find((o) => o.company === exp.company);
      if (opt?.bulletsRewritten && Array.isArray(opt.bulletsRewritten)) {
        return { ...exp, bullets: opt.bulletsRewritten };
      }
      return exp;
    });
  }

  if (
    optimized.skills &&
    typeof optimized.skills === "object" &&
    Array.isArray((optimized.skills as { categoriesRewritten?: string[] }).categoriesRewritten)
  ) {
    merged.skills = (optimized.skills as { categoriesRewritten: string[] }).categoriesRewritten;
  }

  return merged;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = canPerformFreeAction(user, "download");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "You've used all 3 free downloads today. Upgrade to Pro for unlimited downloads.",
          upgradeRequired: true,
          usage: { used: usage.used, limit: usage.limit, action: "download" },
        },
        { status: 429 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });

    if (!resume?.parsedJson) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Build resume data: merge optimization into structured resume
    let resumeData: StructuredResume;
    const originalParsed = JSON.parse(resume.parsedJson) as StructuredResume;

    if (resume.optimizedJson) {
      try {
        const optimizedRaw = JSON.parse(resume.optimizedJson);
        // Check if it's a full StructuredResume or an OptimizationResult
        if (optimizedRaw.contact && Array.isArray(optimizedRaw.experience) && optimizedRaw.experience?.[0]?.bullets) {
          resumeData = optimizedRaw as StructuredResume;
        } else {
          resumeData = mergeOptimization(originalParsed, optimizedRaw);
        }
      } catch {
        resumeData = originalParsed;
      }
    } else {
      resumeData = originalParsed;
    }

    // Load template style if specified
    let templateStyle = undefined;
    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(templateId) },
      });
      if (template?.styleConfig) {
        try { templateStyle = JSON.parse(template.styleConfig); } catch { /* ignore */ }
      }
    }

    await incrementDownloadCount(user.id);

    const buffer = await generateDocx(resumeData, resume.name, templateStyle);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${resume.name}_Optimized.docx"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download." },
      { status: 500 }
    );
  }
}
