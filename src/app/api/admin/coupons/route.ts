import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

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

    // List all coupons from Stripe
    const coupons = await stripe.coupons.list({ limit: 100 });

    // For each coupon, fetch associated promotion codes
    const couponsWithCodes = await Promise.all(
      coupons.data.map(async (coupon) => {
        const promoCodes = await stripe.promotionCodes.list({
          coupon: coupon.id,
          limit: 10,
        });
        return {
          id: coupon.id,
          name: coupon.name,
          percentOff: coupon.percent_off,
          amountOff: coupon.amount_off,
          currency: coupon.currency,
          duration: coupon.duration,
          durationInMonths: coupon.duration_in_months,
          maxRedemptions: coupon.max_redemptions,
          timesRedeemed: coupon.times_redeemed,
          valid: coupon.valid,
          createdAt: new Date(coupon.created * 1000).toISOString(),
          promotionCodes: promoCodes.data.map((pc) => ({
            id: pc.id,
            code: pc.code,
            active: pc.active,
            timesRedeemed: pc.times_redeemed,
            maxRedemptions: pc.max_redemptions,
          })),
        };
      })
    );

    return NextResponse.json({ success: true, data: couponsWithCodes });
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      percentOff,
      amountOff,
      duration,
      durationInMonths,
      maxRedemptions,
      code,
    } = body as {
      name: string;
      percentOff?: number;
      amountOff?: number;
      duration: "once" | "repeating" | "forever";
      durationInMonths?: number;
      maxRedemptions?: number;
      code: string;
    };

    // Validate required fields
    if (!name || !code || !duration) {
      return NextResponse.json(
        { error: "name, code, and duration are required." },
        { status: 400 }
      );
    }

    if (!percentOff && !amountOff) {
      return NextResponse.json(
        { error: "Either percentOff or amountOff is required." },
        { status: 400 }
      );
    }

    if (duration === "repeating" && !durationInMonths) {
      return NextResponse.json(
        { error: "durationInMonths is required for repeating duration." },
        { status: 400 }
      );
    }

    // Build coupon params
    const couponParams: Record<string, unknown> = {
      name,
      duration,
    };

    if (percentOff) {
      couponParams.percent_off = percentOff;
    } else if (amountOff) {
      couponParams.amount_off = amountOff;
      couponParams.currency = "usd";
    }

    if (duration === "repeating" && durationInMonths) {
      couponParams.duration_in_months = durationInMonths;
    }

    if (maxRedemptions) {
      couponParams.max_redemptions = maxRedemptions;
    }

    // Create the coupon in Stripe
    const coupon = await stripe.coupons.create(
      couponParams as Parameters<typeof stripe.coupons.create>[0]
    );

    // Create a promotion code tied to the coupon
    const promotionCode = await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code: code.toUpperCase(),
      max_redemptions: maxRedemptions || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          name: coupon.name,
          percentOff: coupon.percent_off,
          amountOff: coupon.amount_off,
          duration: coupon.duration,
        },
        promotionCode: {
          id: promotionCode.id,
          code: promotionCode.code,
          active: promotionCode.active,
        },
      },
    });
  } catch (error) {
    console.error("Admin coupons POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    // Delete the coupon (this also invalidates associated promotion codes)
    const deleted = await stripe.coupons.del(couponId);

    return NextResponse.json({
      success: true,
      data: { id: deleted.id, deleted: deleted.deleted },
    });
  } catch (error) {
    console.error("Admin coupons DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
