import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromFile, detectFileType, validateFileSize } from "@/lib/resume/parser";
import { parseStructuredResume } from "@/lib/resume/structured";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file size
    if (!validateFileSize(buffer)) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Detect and validate file type
    const detectedType = detectFileType(buffer);
    const mimeType = detectedType || file.type;

    // Extract text
    let rawText: string;
    try {
      rawText = await extractTextFromFile(buffer, mimeType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to extract text from file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Parse into structured format
    const structured = parseStructuredResume(rawText);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name: file.name.replace(/\.[^.]+$/, ""),
        rawText,
        parsedJson: JSON.stringify(structured),
        version: 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: resume.id,
        name: resume.name,
        structured,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Something went wrong processing your resume." },
      { status: 500 }
    );
  }
}
