import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        scans: {
          select: { id: true, scoreTotal: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, data: resumes });
  } catch (error) {
    console.error("List resumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes." },
      { status: 500 }
    );
  }
}
