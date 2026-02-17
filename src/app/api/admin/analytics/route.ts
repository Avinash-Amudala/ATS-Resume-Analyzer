import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = "avinashamudala@gmail.com";

async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const email = user.emailAddresses[0]?.emailAddress;
  return email === ADMIN_EMAIL;
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // Run all queries in parallel
    const [
      totalUsers,
      totalScans,
      totalOptimizations,
      proUsers,
      todayUsers,
      todayScans,
      weekScans,
      monthScans,
      todayOptimizations,
      weekOptimizations,
      recentScans,
      topCompanies,
      atsSystemUsage,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.scan.count(),
      prisma.optimization.count(),
      prisma.user.count({ where: { plan: { in: ["pro", "lifetime"] } } }),

      // Today's activity
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.scan.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.scan.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.scan.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.optimization.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.optimization.count({ where: { createdAt: { gte: weekStart } } }),

      // Recent scans with user info
      prisma.scan.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          scoreTotal: true,
          jdCompany: true,
          createdAt: true,
          user: { select: { email: true, name: true, plan: true } },
        },
      }),

      // Top companies detected
      prisma.scan.groupBy({
        by: ["jdCompany"],
        where: { jdCompany: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),

      // ATS system distribution
      prisma.atsCompany.groupBy({
        by: ["atsSystem"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    // AI cost analysis
    const aiCosts = await prisma.optimization.aggregate({
      _sum: { costUsd: true, promptTokens: true, completionTokens: true },
      _count: { id: true },
    });

    // Score distribution
    const scoreDistribution = {
      excellent: await prisma.scan.count({ where: { scoreTotal: { gte: 90 } } }),
      good: await prisma.scan.count({ where: { scoreTotal: { gte: 70, lt: 90 } } }),
      fair: await prisma.scan.count({ where: { scoreTotal: { gte: 50, lt: 70 } } }),
      poor: await prisma.scan.count({ where: { scoreTotal: { lt: 50 } } }),
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          proUsers,
          totalScans,
          totalOptimizations,
          conversionRate: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : "0",
        },
        activity: {
          today: { users: todayUsers, scans: todayScans, optimizations: todayOptimizations },
          thisWeek: { scans: weekScans, optimizations: weekOptimizations },
          thisMonth: { scans: monthScans },
        },
        aiUsage: {
          totalOptimizations: aiCosts._count.id,
          totalCostUsd: (aiCosts._sum.costUsd || 0).toFixed(4),
          totalPromptTokens: aiCosts._sum.promptTokens || 0,
          totalCompletionTokens: aiCosts._sum.completionTokens || 0,
          avgCostPerOptimization: aiCosts._count.id > 0
            ? ((aiCosts._sum.costUsd || 0) / aiCosts._count.id).toFixed(6)
            : "0",
        },
        scoreDistribution,
        topCompanies: topCompanies.map((c) => ({
          company: c.jdCompany,
          count: c._count.id,
        })),
        atsSystemDistribution: atsSystemUsage.map((a) => ({
          system: a.atsSystem,
          count: a._count.id,
        })),
        recentScans: recentScans.map((s) => ({
          id: s.id,
          score: s.scoreTotal,
          company: s.jdCompany,
          user: s.user?.email || "unknown",
          plan: s.user?.plan || "free",
          date: s.createdAt.toISOString(),
        })),
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
