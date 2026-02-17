import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jdText } = body;

    if (!jdText) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    // Try to detect company name from JD
    const companies = await prisma.atsCompany.findMany();
    let detectedCompany = null;

    const jdLower = jdText.toLowerCase();
    for (const company of companies) {
      if (
        jdLower.includes(company.companyName.toLowerCase()) ||
        (company.companyDomain && jdLower.includes(company.companyDomain.toLowerCase()))
      ) {
        detectedCompany = company;
        break;
      }
    }

    if (detectedCompany) {
      const atsSystem = await prisma.atsSystem.findFirst({
        where: { name: detectedCompany.atsSystem },
      });

      return NextResponse.json({
        success: true,
        data: {
          company: detectedCompany.companyName,
          atsSystem: detectedCompany.atsSystem,
          tips: atsSystem?.tips ? JSON.parse(atsSystem.tips) : [],
          acceptsPdf: detectedCompany.acceptsPdf,
          acceptsDocx: detectedCompany.acceptsDocx,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "Could not detect company ATS from job description.",
    });
  } catch (error) {
    console.error("ATS detect error:", error);
    return NextResponse.json(
      { error: "Failed to detect ATS." },
      { status: 500 }
    );
  }
}
