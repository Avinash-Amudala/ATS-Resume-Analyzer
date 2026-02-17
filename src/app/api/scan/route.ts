import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, incrementScanCount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runATSScoring } from "@/lib/scoring";
import { isPro } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit for free users
    if (!isPro(user.plan) && user.scansToday >= 3) {
      return NextResponse.json(
        {
          error: "You've reached your daily scan limit (3/day). Upgrade to Pro for unlimited scans.",
          upgradeRequired: true,
          usage: {
            used: user.scansToday,
            limit: 3,
            action: "scan",
          },
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jdText = formData.get("jdText") as string | null;
    const resumeId = formData.get("resumeId") as string | null;

    if (!jdText || jdText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide a job description (at least 50 characters)." },
        { status: 400 }
      );
    }

    let resumeText: string;
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;
    let finalResumeId: string;

    if (file) {
      // New file upload + scan
      const { extractTextFromFile, detectFileType, validateFileSize } = await import("@/lib/resume/parser");
      const { parseStructuredResume } = await import("@/lib/resume/structured");

      fileBuffer = Buffer.from(await file.arrayBuffer());

      if (!validateFileSize(fileBuffer)) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
      }

      const detectedType = detectFileType(fileBuffer);
      mimeType = detectedType || file.type;
      fileName = file.name;

      try {
        resumeText = await extractTextFromFile(fileBuffer, mimeType);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to parse file.";
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      const structured = parseStructuredResume(resumeText);

      const resume = await prisma.resume.create({
        data: {
          userId: user.id,
          name: fileName.replace(/\.[^.]+$/, ""),
          rawText: resumeText,
          parsedJson: JSON.stringify(structured),
        },
      });
      finalResumeId = resume.id;
    } else if (resumeId) {
      // Scan existing resume
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      });
      if (!resume || !resume.rawText) {
        return NextResponse.json({ error: "Resume not found." }, { status: 404 });
      }
      resumeText = resume.rawText;
      fileBuffer = Buffer.from(resumeText, "utf-8");
      fileName = resume.name + ".txt";
      mimeType = "text/plain";
      finalResumeId = resume.id;
    } else {
      return NextResponse.json(
        { error: "Provide a resume file or resumeId." },
        { status: 400 }
      );
    }

    // Run ATS scoring
    const scoreResult = runATSScoring({
      resumeText,
      jdText,
      fileBuffer,
      fileName,
      mimeType,
    });

    // Detect company ATS from job description
    let detectedCompany: string | null = null;
    let detectedAts: string | null = null;
    let atsTips: string[] = [];
    try {
      const companies = await prisma.atsCompany.findMany();
      const jdLower = jdText.toLowerCase();
      for (const company of companies) {
        if (
          jdLower.includes(company.companyName.toLowerCase()) ||
          (company.companyDomain && jdLower.includes(company.companyDomain.toLowerCase()))
        ) {
          detectedCompany = company.companyName;
          detectedAts = company.atsSystem;

          // Fetch ATS tips
          const atsSystem = await prisma.atsSystem.findFirst({
            where: { name: company.atsSystem },
          });
          if (atsSystem?.tips) {
            atsTips = JSON.parse(atsSystem.tips);
          }
          break;
        }
      }
    } catch (e) {
      console.error("ATS detection error (non-fatal):", e);
    }

    // Save scan to database
    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        resumeId: finalResumeId,
        jdText,
        jdCompany: detectedCompany,
        detectedAts: detectedAts,
        scoreTotal: scoreResult.totalScore,
        scoreBreakdown: JSON.stringify(scoreResult.checks),
        missingKeywords: JSON.stringify(scoreResult.missingKeywords),
      },
    });

    // Increment scan count
    await incrementScanCount(user.id);

    return NextResponse.json({
      success: true,
      data: {
        scanId: scan.id,
        resumeId: finalResumeId,
        totalScore: scoreResult.totalScore,
        checks: scoreResult.checks,
        missingKeywords: isPro(user.plan)
          ? scoreResult.missingKeywords
          : scoreResult.missingKeywords.slice(0, 10),
        formattingIssues: scoreResult.formattingIssues,
        // ATS company detection info
        detectedCompany,
        detectedAts,
        atsTips,
        // Usage info for frontend
        usage: {
          scansUsed: user.scansToday + 1,
          scansLimit: isPro(user.plan) ? "unlimited" : 3,
          downloadsUsed: user.downloadsToday,
          downloadsLimit: isPro(user.plan) ? "unlimited" : 3,
          optimizesUsed: user.optimizesToday,
          optimizesLimit: isPro(user.plan) ? "unlimited" : 3,
          isPro: isPro(user.plan),
        },
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Something went wrong analyzing your resume." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("id");

    if (scanId) {
      const scan = await prisma.scan.findFirst({
        where: { id: scanId, userId: user.id },
        include: { optimizations: true },
      });
      if (!scan) {
        return NextResponse.json({ error: "Scan not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...scan,
          // Include usage info
          usage: {
            scansUsed: user.scansToday,
            scansLimit: isPro(user.plan) ? "unlimited" : 3,
            downloadsUsed: user.downloadsToday,
            downloadsLimit: isPro(user.plan) ? "unlimited" : 3,
            optimizesUsed: user.optimizesToday,
            optimizesLimit: isPro(user.plan) ? "unlimited" : 3,
            isPro: isPro(user.plan),
          },
        },
      });
    }

    const scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        scoreTotal: true,
        jdCompany: true,
        detectedAts: true,
        createdAt: true,
        resume: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    console.error("Get scans error:", error);
    return NextResponse.json({ error: "Failed to fetch scans." }, { status: 500 });
  }
}
