"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Crown } from "lucide-react";

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

const SECTION_LABELS: Record<string, string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
};

const TEMPLATE_SECTIONS: Record<number, string[]> = {
  1: ["contact", "summary", "experience", "education", "skills", "certifications", "projects"],
  2: ["contact", "summary", "experience", "education", "skills"],
  3: ["contact", "summary", "experience", "skills", "certifications"],
  4: ["contact", "summary", "experience", "projects", "skills"],
  5: ["contact", "summary", "experience", "education", "certifications", "skills"],
  6: ["contact", "summary", "education", "certifications", "experience", "skills", "projects"],
  7: ["contact", "summary", "skills", "experience", "education", "projects"],
  8: ["contact", "summary", "education", "projects", "skills", "experience", "certifications"],
};

function ResumePreview({
  font,
  color,
  sections,
}: {
  font: string;
  color: string;
  sections: string[];
}) {
  return (
    <div
      className="w-full bg-white rounded shadow-inner border border-gray-200 p-3 overflow-hidden"
      style={{ fontFamily: font, minHeight: 220 }}
    >
      {/* Name / Title area */}
      <div className="text-center mb-2">
        <div
          className="h-2.5 rounded mx-auto mb-1"
          style={{ width: "55%", backgroundColor: color }}
        />
        <div className="h-1.5 rounded bg-gray-300 mx-auto" style={{ width: "35%" }} />
      </div>

      {/* Contact line */}
      <div className="flex justify-center gap-1 mb-2">
        <div className="h-1 rounded bg-gray-200" style={{ width: "18%" }} />
        <div className="h-1 rounded bg-gray-200" style={{ width: "22%" }} />
        <div className="h-1 rounded bg-gray-200" style={{ width: "16%" }} />
      </div>

      <div className="border-t border-gray-100 my-1.5" />

      {/* Sections */}
      {sections
        .filter((s) => s !== "contact")
        .map((section) => (
          <div key={section} className="mb-1.5">
            {/* Section header */}
            <div
              className="h-1.5 rounded mb-1"
              style={{
                width: `${SECTION_LABELS[section]?.length ? SECTION_LABELS[section].length * 6 + 10 : 40}%`,
                maxWidth: "60%",
                minWidth: "20%",
                backgroundColor: color,
                opacity: 0.75,
              }}
            />
            {/* Content lines */}
            {section === "summary" ? (
              <>
                <div className="h-1 rounded bg-gray-200 mb-0.5" style={{ width: "95%" }} />
                <div className="h-1 rounded bg-gray-200" style={{ width: "80%" }} />
              </>
            ) : (
              <>
                <div className="h-1 rounded bg-gray-200 mb-0.5" style={{ width: "90%" }} />
                <div className="h-1 rounded bg-gray-100 mb-0.5" style={{ width: "75%" }} />
                <div className="h-1 rounded bg-gray-100" style={{ width: "60%" }} />
              </>
            )}
          </div>
        ))}
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/subscription")
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([templatesData, subData]) => {
        if (templatesData.success) setTemplates(templatesData.data);
        if (subData?.success) setUserPlan(subData.data.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const getFont = (tmpl: (typeof displayTemplates)[0]) =>
    "font" in tmpl ? tmpl.font : tmpl.styleConfig?.font?.name ?? "sans-serif";

  const getColor = (tmpl: (typeof displayTemplates)[0]) =>
    "color" in tmpl ? tmpl.color : tmpl.styleConfig?.colors?.heading ?? "#2563eb";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Template Gallery</h1>
          <p className="text-muted-foreground">
            Preview FAANG-proven resume templates optimized for specific ATS systems
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

        {/* Template grid */}
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTemplates.map((tmpl) => {
              const isProTemplate = tmpl.tier === "pro";
              const isLocked = isProTemplate && !isPro;
              const font = getFont(tmpl);
              const color = getColor(tmpl);
              const sections = TEMPLATE_SECTIONS[tmpl.id] ?? TEMPLATE_SECTIONS[1];

              return (
                <Card
                  key={tmpl.id || tmpl.name}
                  className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Visual resume preview */}
                  <div className="relative p-3 bg-gray-50">
                    <ResumePreview font={font} color={color} sections={sections} />

                    {/* Lock overlay for Pro templates */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-t">
                        <div className="bg-white/90 rounded-full p-2.5 shadow-sm">
                          <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    )}

                    {/* Preview label */}
                    <span className="absolute top-4 right-4 text-[10px] font-medium uppercase tracking-wider text-gray-400 bg-white/80 rounded px-1.5 py-0.5">
                      Preview
                    </span>
                  </div>

                  {/* Template info */}
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                      {isProTemplate ? (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1 text-yellow-500" /> Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tmpl.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sections
                        .filter((s) => s !== "contact")
                        .slice(0, 5)
                        .map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5"
                          >
                            {SECTION_LABELS[s]}
                          </span>
                        ))}
                      {sections.filter((s) => s !== "contact").length > 5 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                          +{sections.filter((s) => s !== "contact").length - 5} more
                        </span>
                      )}
                    </div>
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
