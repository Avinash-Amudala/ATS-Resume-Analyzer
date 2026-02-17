import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPro } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { resumeId } = body;

    // Get template
    const template = await prisma.template.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    // Check tier access
    if (template.tier === "pro" && !isPro(user.plan)) {
      return NextResponse.json(
        { error: "This template requires Pro. Upgrade to unlock." },
        { status: 403 }
      );
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume?.parsedJson) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const resumeData = JSON.parse(resume.parsedJson);
    const styleConfig = JSON.parse(template.styleConfig);

    return NextResponse.json({
      success: true,
      data: {
        resumeData,
        templateName: template.name,
        styleConfig,
      },
    });
  } catch (error) {
    console.error("Apply template error:", error);
    return NextResponse.json(
      { error: "Failed to apply template." },
      { status: 500 }
    );
  }
}
