import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";
import type { UserPlan } from "@/types";

const FREE_DAILY_LIMIT = 3;

export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        plan: "free",
      },
    });
  }

  // Reset daily counters if past reset time
  const now = new Date();
  if (now > user.scansResetAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        scansToday: 0,
        downloadsToday: 0,
        optimizesToday: 0,
        scansResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  }

  return user;
}

export async function getUserPlan(): Promise<UserPlan> {
  const user = await getOrCreateUser();
  return (user?.plan as UserPlan) ?? "free";
}

export async function requirePro() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  if (user.plan === "free") throw new Error("Pro feature - upgrade required");
  return user;
}

export async function incrementScanCount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { scansToday: { increment: 1 } },
  });
}

export async function incrementDownloadCount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { downloadsToday: { increment: 1 } },
  });
}

export async function incrementOptimizeCount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { optimizesToday: { increment: 1 } },
  });
}

export function canPerformFreeAction(
  user: { plan: string; scansToday: number; downloadsToday: number; optimizesToday: number },
  action: "scan" | "download" | "optimize"
): { allowed: boolean; used: number; limit: number } {
  if (user.plan === "pro" || user.plan === "lifetime") {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const counters = {
    scan: user.scansToday,
    download: user.downloadsToday,
    optimize: user.optimizesToday,
  };

  const used = counters[action];
  return {
    allowed: used < FREE_DAILY_LIMIT,
    used,
    limit: FREE_DAILY_LIMIT,
  };
}

export { FREE_DAILY_LIMIT };
