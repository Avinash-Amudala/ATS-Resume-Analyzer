"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap, Loader2, CheckCircle, ArrowLeft, Crown, Download,
  FileText, Lock
} from "lucide-react";

interface OptimizedData {
  summary: string;
  experience: {
    company: string;
    bulletsRewritten: string[];
    changesExplanation: string;
  }[];
  skills: {
    categoriesRewritten: string[];
    changesExplanation: string;
  };
}

interface UsageData {
  optimizesUsed: number;
  optimizesRemaining: number;
  downloadsUsed: number;
  downloadsRemaining: number;
  isPro: boolean;
}

interface TemplateItem {
  id: number;
  name: string;
  description: string;
  tier: string;
  font: string;
  color: string;
}

const TEMPLATES: TemplateItem[] = [
  { id: 1, name: "Classic Clean", description: "Maximum ATS compatibility with clean layout", tier: "free", font: "Calibri", color: "#2563eb" },
  { id: 2, name: "Google SWE", description: "Compact, metric-heavy for FAANG", tier: "pro", font: "Garamond", color: "#2563eb" },
  { id: 3, name: "Amazon LP", description: "STAR format for Amazon Leadership Principles", tier: "pro", font: "Arial", color: "#FF9900" },
  { id: 4, name: "Startup Bold", description: "Modern design for startup culture", tier: "pro", font: "Inter", color: "#7c3aed" },
  { id: 5, name: "Enterprise", description: "Conservative format for large orgs", tier: "pro", font: "Times New Roman", color: "#1e3a5f" },
  { id: 6, name: "Research/PhD", description: "Publications-first for academic roles", tier: "pro", font: "Cambria", color: "#1e40af" },
  { id: 7, name: "Career Switcher", description: "Skills-first functional hybrid", tier: "pro", font: "Segoe UI", color: "#0d9488" },
  { id: 8, name: "New Grad", description: "Education-focused for entry-level", tier: "free", font: "Calibri", color: "#3b82f6" },
];

export default function OptimizePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedData | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [step, setStep] = useState<"optimize" | "template" | "done">("optimize");

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const [subRes, scanRes] = await Promise.all([
          fetch("/api/subscription"),
          fetch(`/api/scan?id=${params.scanId}`),
        ]);
        const subData = await subRes.json();
        const scanData = await scanRes.json();

        if (subData.success) {
          const d = subData.data;
          setUsage({
            optimizesUsed: d.usage.optimizations.used,
            optimizesRemaining: d.isPro ? Infinity : Math.max(0, d.usage.optimizations.limit - d.usage.optimizations.used),
            downloadsUsed: d.usage.downloads.used,
            downloadsRemaining: d.isPro ? Infinity : Math.max(0, d.usage.downloads.limit - d.usage.downloads.used),
            isPro: d.isPro,
          });
        }

        if (scanData.success) {
          setResumeId(scanData.data.resumeId);
        }
      } catch {
        // Non-fatal
      }
    };
    fetchUsage();
  }, [params.scanId]);

  const handleOptimize = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: params.scanId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Optimization failed.");
        return;
      }

      setOptimized(data.data.optimized);
      setStep("template"); // Move to template selection

      if (usage && !usage.isPro) {
        setUsage({
          ...usage,
          optimizesUsed: usage.optimizesUsed + 1,
          optimizesRemaining: Math.max(0, usage.optimizesRemaining - 1),
        });
      }
    } catch {
      setError("AI optimization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeId) return;

    if (usage && !usage.isPro && usage.downloadsRemaining <= 0) {
      router.push("/pricing");
      return;
    }

    setDownloadLoading(true);
    setError("");
    try {
      const url = `/api/download/${resumeId}?format=docx&templateId=${selectedTemplate}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        if (data.upgradeRequired) {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Download failed.");
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "Resume_Optimized.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();

      setStep("done");

      if (usage && !usage.isPro) {
        setUsage({
          ...usage,
          downloadsUsed: usage.downloadsUsed + 1,
          downloadsRemaining: Math.max(0, usage.downloadsRemaining - 1),
        });
      }
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const canOptimize = !usage || usage.isPro || usage.optimizesRemaining > 0;
  const canDownload = !usage || usage.isPro || usage.downloadsRemaining > 0;
  const isPro = usage?.isPro ?? false;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push(`/analyze/${params.scanId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Button>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["AI Optimize", "Choose Template", "Download"].map((label, i) => {
            const stepNum = i + 1;
            const currentStep = step === "optimize" ? 1 : step === "template" ? 2 : 3;
            const isActive = stepNum <= currentStep;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {stepNum <= currentStep - 1 ? <CheckCircle className="h-5 w-5" /> : stepNum}
                </div>
                <span className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-12 h-0.5 ${isActive ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {usage && !usage.isPro && (
          <div className="text-center mb-6">
            <p className="text-sm text-blue-600 font-medium">
              {usage.optimizesRemaining > 0
                ? `${usage.optimizesRemaining} free optimization${usage.optimizesRemaining === 1 ? "" : "s"} remaining`
                : "No free optimizations remaining"}
              {" | "}
              {usage.downloadsRemaining > 0
                ? `${usage.downloadsRemaining} free download${usage.downloadsRemaining === 1 ? "" : "s"} remaining`
                : "No free downloads remaining"}
            </p>
          </div>
        )}

        {/* STEP 1: Optimize */}
        {step === "optimize" && !loading && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Ready to Optimize?</h2>
              <p className="text-muted-foreground mb-6">
                Our AI will rewrite your resume sections to naturally integrate
                missing keywords and boost your ATS score to 90+.
              </p>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              {canOptimize ? (
                <Button size="lg" onClick={handleOptimize}>
                  <Zap className="mr-2 h-5 w-5" /> Optimize My Resume
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button size="lg"><Crown className="mr-2 h-4 w-4" /> Upgrade to Continue</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Optimizing with AI...</h2>
              <p className="text-muted-foreground">
                Gemini 2.5 Flash is rewriting your resume. This may take 10-30 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Template Selection + Review */}
        {step === "template" && optimized && (
          <div className="space-y-8">
            {/* Success banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">AI Optimization complete!</p>
                  <p className="text-sm text-green-700">Choose a template below, then download your optimized resume.</p>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <div>
              <h2 className="text-xl font-bold mb-4">Choose Your Resume Template</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {TEMPLATES.map((tmpl) => {
                  const isLocked = tmpl.tier === "pro" && !isPro;
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <Card
                      key={tmpl.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
                      } ${isLocked ? "opacity-75" : ""}`}
                      onClick={() => {
                        if (isLocked) {
                          router.push("/pricing");
                        } else {
                          setSelectedTemplate(tmpl.id);
                        }
                      }}
                    >
                      <div
                        className="h-24 flex items-center justify-center relative rounded-t-lg"
                        style={{ background: `linear-gradient(135deg, ${tmpl.color}20, ${tmpl.color}05)` }}
                      >
                        <FileText className="h-10 w-10" style={{ color: tmpl.color }} />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-t-lg">
                            <Lock className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{tmpl.name}</h4>
                          <Badge variant={tmpl.tier === "pro" ? "secondary" : "outline"} className="text-xs">
                            {tmpl.tier === "pro" ? "Pro" : "Free"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{tmpl.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Optimization Review */}
            <div>
              <h2 className="text-xl font-bold mb-4">AI Changes Preview</h2>

              {/* Summary */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    Professional Summary <Badge variant="secondary" className="text-xs">Rewritten</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-green-50 p-3 rounded border border-green-200">{optimized.summary}</p>
                </CardContent>
              </Card>

              {/* Experience */}
              {optimized.experience?.map((exp, i) => (
                <Card key={i} className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {exp.company} <Badge variant="secondary" className="text-xs">Rewritten</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exp.bulletsRewritten?.map((bullet, j) => (
                        <li key={j} className="text-sm bg-green-50 p-2 rounded border border-green-200">{bullet}</li>
                      ))}
                    </ul>
                    <Separator className="my-3" />
                    <p className="text-xs text-muted-foreground">{exp.changesExplanation}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Skills */}
              {optimized.skills && (
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      Skills <Badge variant="secondary" className="text-xs">Reorganized</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {optimized.skills.categoriesRewritten?.map((skill, i) => (
                        <Badge key={i} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Download Action */}
            <div className="text-center space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {canDownload ? (
                <Button size="lg" onClick={handleDownload} disabled={downloadLoading} className="px-10">
                  {downloadLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Resume...</>
                  ) : (
                    <><Download className="mr-2 h-5 w-5" /> Download Optimized Resume (DOCX)</>
                  )}
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button size="lg"><Crown className="mr-2 h-4 w-4" /> Upgrade to Download</Button>
                </Link>
              )}
              <p className="text-xs text-muted-foreground">
                Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name || "Classic Clean"}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === "done" && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Resume Downloaded!</h2>
              <p className="text-muted-foreground mb-6">
                Your AI-optimized resume has been downloaded. Good luck with your application!
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push(`/analyze/${params.scanId}`)}>
                  View ATS Score
                </Button>
                <Button onClick={() => router.push("/analyze")}>
                  Scan Another Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
