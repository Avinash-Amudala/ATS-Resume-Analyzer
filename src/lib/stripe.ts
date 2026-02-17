import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "3 scans per day",
      "Top 10 missing keywords",
      "Formatting audit",
      "Basic ATS score",
    ],
  },
  "pro-monthly": {
    name: "Pro Monthly",
    price: 15,
    priceId: process.env.STRIPE_PRICE_MONTHLY,
    features: [
      "Unlimited scans",
      "AI-powered optimization",
      "8 FAANG resume templates",
      "Cover letter generator",
      "Multi-resume management",
      "Ad-free experience",
    ],
  },
  "pro-yearly": {
    name: "Pro Annual",
    price: 149,
    priceId: process.env.STRIPE_PRICE_YEARLY,
    features: [
      "Everything in Pro Monthly",
      "17% discount ($12.40/month)",
      "Priority support",
    ],
  },
  lifetime: {
    name: "Lifetime",
    price: 299,
    features: [
      "Everything in Pro",
      "One-time payment",
      "All future features included",
      "Lifetime access",
    ],
  },
} as const;

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
