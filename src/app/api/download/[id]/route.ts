import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, canPerformFreeAction, incrementDownloadCount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateDocx } from "@/lib/resume/generator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check freemium limit (3 free downloads/day)
    const usage = canPerformFreeAction(user, "download");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "You've used all 3 free downloads today. Upgrade to Pro for unlimited downloads.",
          upgradeRequired: true,
          usage: {
            used: usage.used,
            limit: usage.limit,
            action: "download",
          },
        },
        { status: 429 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "docx";

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });

    if (!resume?.parsedJson) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const resumeData = JSON.parse(resume.optimizedJson || resume.parsedJson);

    // Increment download count for free users
    await incrementDownloadCount(user.id);

    if (format === "docx") {
      const buffer = await generateDocx(resumeData, resume.name);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${resume.name}_Optimized.docx"`,
        },
      });
    }

    // PDF - for now return the DOCX (PDF generation requires puppeteer which is heavy)
    const buffer = await generateDocx(resumeData, resume.name);
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
