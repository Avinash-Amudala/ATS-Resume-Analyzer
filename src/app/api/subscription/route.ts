import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, FREE_DAILY_LIMIT } from "@/lib/auth";
import { stripe, createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPro = user.plan === "pro" || user.plan === "lifetime";

    return NextResponse.json({
      success: true,
      data: {
        plan: user.plan,
        isPro,
        usage: {
          scans: {
            used: user.scansToday,
            limit: isPro ? "unlimited" : FREE_DAILY_LIMIT,
            remaining: isPro ? "unlimited" : Math.max(0, FREE_DAILY_LIMIT - user.scansToday),
          },
          downloads: {
            used: user.downloadsToday,
            limit: isPro ? "unlimited" : FREE_DAILY_LIMIT,
            remaining: isPro ? "unlimited" : Math.max(0, FREE_DAILY_LIMIT - user.downloadsToday),
          },
          optimizations: {
            used: user.optimizesToday,
            limit: isPro ? "unlimited" : FREE_DAILY_LIMIT,
            remaining: isPro ? "unlimited" : Math.max(0, FREE_DAILY_LIMIT - user.optimizesToday),
          },
        },
        resetsAt: user.scansResetAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, plan } = body;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (action === "checkout") {
      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId: user.id },
        });
        customerId = customer.id;

        const { prisma } = await import("@/lib/db");
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const priceId =
        plan === "pro-yearly"
          ? process.env.STRIPE_PRICE_YEARLY
          : process.env.STRIPE_PRICE_MONTHLY;

      if (!priceId) {
        return NextResponse.json(
          { error: "Pricing not configured." },
          { status: 500 }
        );
      }

      const session = await createCheckoutSession(
        customerId,
        priceId,
        `${appUrl}/dashboard?success=true`,
        `${appUrl}/pricing?canceled=true`
      );

      return NextResponse.json({ success: true, data: { url: session.url } });
    }

    if (action === "portal") {
      if (!user.stripeCustomerId) {
        return NextResponse.json(
          { error: "No subscription found." },
          { status: 400 }
        );
      }

      const session = await createCustomerPortalSession(
        user.stripeCustomerId,
        `${appUrl}/dashboard`
      );

      return NextResponse.json({ success: true, data: { url: session.url } });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Subscription action error:", error);
    return NextResponse.json(
      { error: "Subscription operation failed." },
      { status: 500 }
    );
  }
}
