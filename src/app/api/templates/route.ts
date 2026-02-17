import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: templates.map((t) => ({
        ...t,
        styleConfig: JSON.parse(t.styleConfig),
      })),
    });
  } catch (error) {
    console.error("Templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates." },
      { status: 500 }
    );
  }
}
