import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
      include: {
        scans: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume." }, { status: 500 });
  }
}

export async function PUT(
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

    const resume = await prisma.resume.updateMany({
      where: { id, userId: user.id },
      data: { name: body.name },
    });

    if (resume.count === 0) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed to update resume." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resume = await prisma.resume.deleteMany({
      where: { id, userId: user.id },
    });

    if (resume.count === 0) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume." }, { status: 500 });
  }
}
