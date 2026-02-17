"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Lock, Crown, CheckCircle } from "lucide-react";

interface TemplateItem {
  id: number;
  name: string;
  description: string;
  tier: string;
  styleConfig: {
    font: { name: string };
    colors: { heading: string };
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    // Fetch templates and subscription info in parallel
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/subscription").then((r) => r.json()).catch(() => null),
    ]).then(([templatesData, subData]) => {
      if (templatesData.success) setTemplates(templatesData.data);
      if (subData?.success) setUserPlan(subData.data.plan);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fallback static templates if none in DB yet
  const staticTemplates = [
    { id: 1, name: "Classic Clean", description: "Maximum ATS compatibility with clean, single-column layout.", tier: "free", font: "Calibri", color: "#2563eb" },
    { id: 2, name: "Google SWE", description: "Compact, metric-heavy format optimized for FAANG applications.", tier: "pro", font: "Garamond", color: "#2563eb" },
    { id: 3, name: "Amazon LP", description: "STAR format bullets aligned with Amazon Leadership Principles.", tier: "pro", font: "Arial", color: "#FF9900" },
    { id: 4, name: "Startup Bold", description: "Modern, personality-forward design for startup culture.", tier: "pro", font: "Inter", color: "#7c3aed" },
    { id: 5, name: "Enterprise", description: "Conservative, credential-heavy format for large organizations.", tier: "pro", font: "Times New Roman", color: "#1e3a5f" },
    { id: 6, name: "Research/PhD", description: "Publications-first layout for academic and research roles.", tier: "pro", font: "Cambria", color: "#1e40af" },
    { id: 7, name: "Career Switcher", description: "Skills-first functional hybrid emphasizing transferable skills.", tier: "pro", font: "Segoe UI", color: "#0d9488" },
    { id: 8, name: "New Grad", description: "Education and projects prominent for entry-level candidates.", tier: "free", font: "Calibri", color: "#3b82f6" },
  ];

  const displayTemplates = templates.length > 0 ? templates : staticTemplates;
  const isPro = userPlan === "pro" || userPlan === "lifetime";

  const handleTemplateClick = (tmpl: (typeof displayTemplates)[0]) => {
    const isProTemplate = tmpl.tier === "pro";

    if (isProTemplate && !isPro) {
      // Redirect to pricing for Pro templates
      router.push("/pricing");
    } else {
      // Navigate to analyze page with template ID
      router.push(`/analyze?template=${tmpl.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Resume Templates</h1>
          <p className="text-muted-foreground">
            FAANG-proven templates optimized for specific ATS systems
          </p>
          {!isPro && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Crown className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                2 free templates available.{" "}
                <Link href="/pricing" className="font-semibold underline">
                  Upgrade to Pro
                </Link>{" "}
                to unlock all 8 templates.
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTemplates.map((tmpl) => {
              const isProTemplate = tmpl.tier === "pro";
              const isLocked = isProTemplate && !isPro;
              return (
                <Card
                  key={tmpl.id || tmpl.name}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    isLocked ? "opacity-90" : ""
                  }`}
                  onClick={() => handleTemplateClick(tmpl)}
                >
                  <div
                    className="h-48 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${("color" in tmpl ? tmpl.color : "#2563eb")}15, ${("color" in tmpl ? tmpl.color : "#2563eb")}05)`,
                    }}
                  >
                    <FileText
                      className="h-16 w-16"
                      style={{ color: "color" in tmpl ? tmpl.color : "#2563eb" }}
                    />
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-2">
                          <Lock className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{tmpl.name}</h3>
                      {isProTemplate ? (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" /> Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tmpl.description}
                    </p>
                    <Button
                      variant={isLocked ? "default" : "outline"}
                      className="w-full"
                      size="sm"
                    >
                      {isLocked ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" /> Unlock with Pro
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Use Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pro CTA Section */}
        {!isPro && (
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="pt-8 pb-8">
                <Crown className="h-10 w-10 text-yellow-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Unlock All 8 Templates</h2>
                <p className="text-blue-100 mb-6 max-w-md mx-auto">
                  Get access to FAANG-specific templates, unlimited scans, AI optimization,
                  and downloadable resumes.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/pricing">
                    <Button variant="secondary" size="lg" className="font-bold">
                      Upgrade for $15/mo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
