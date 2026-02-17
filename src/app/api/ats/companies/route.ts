import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const companies = await prisma.atsCompany.findMany({
      where: {
        companyName: { contains: query },
      },
      take: 10,
      orderBy: { companyName: "asc" },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error("ATS companies error:", error);
    return NextResponse.json(
      { error: "Failed to search companies." },
      { status: 500 }
    );
  }
}
