"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Star, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", plan }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      // Handle error
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Get started with basic ATS scanning",
      features: [
        "3 scans per day",
        "10 ATS compatibility checks",
        "Top 10 missing keywords",
        "Formatting audit",
        "ATS score breakdown",
      ],
      cta: "Current Plan",
      popular: false,
      action: null,
    },
    {
      name: "Pro Monthly",
      price: "$15",
      period: "/month",
      description: "Full power for active job seekers",
      features: [
        "Unlimited scans",
        "AI-powered resume optimization",
        "8 FAANG resume templates",
        "Cover letter generator",
        "Multi-resume management (20)",
        "DOCX & PDF downloads",
        "Company-specific ATS intelligence",
        "Ad-free experience",
      ],
      cta: "Start Pro Monthly",
      popular: true,
      action: () => handleCheckout("pro-monthly"),
    },
    {
      name: "Pro Annual",
      price: "$149",
      period: "/year",
      description: "Save 17% with annual billing",
      features: [
        "Everything in Pro Monthly",
        "$12.40/month (17% savings)",
        "Priority support",
      ],
      cta: "Start Pro Annual",
      popular: false,
      action: () => handleCheckout("pro-yearly"),
    },
    {
      name: "Lifetime",
      price: "$299",
      period: "one-time",
      description: "Pay once, use forever",
      features: [
        "Everything in Pro",
        "One-time payment",
        "All future features included",
        "Lifetime access guaranteed",
        "Priority support forever",
      ],
      cta: "Get Lifetime Access",
      popular: false,
      action: () => handleCheckout("lifetime"),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free with 3 daily scans. Upgrade to Pro when you need AI optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-blue-600 border-2 relative" : ""}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      {plan.popular ? (
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      ) : plan.name === "Lifetime" ? (
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.action ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={plan.action}
                    disabled={loading === plan.name}
                  >
                    {loading === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
