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
import { Zap, Loader2, CheckCircle, ArrowLeft, Crown, Download } from "lucide-react";

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

export default function OptimizePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedData | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Fetch usage info on mount
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

      // Update local usage
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
    try {
      const res = await fetch(`/api/download/${resumeId}?format=docx`);
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume_Optimized.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push(`/analyze/${params.scanId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Resume Optimization</h1>
          <p className="text-muted-foreground">
            Let AI rewrite your resume to maximize ATS compatibility
          </p>
          {usage && !usage.isPro && (
            <p className="text-sm text-blue-600 mt-2 font-medium">
              {usage.optimizesRemaining > 0
                ? `${usage.optimizesRemaining} free optimization${usage.optimizesRemaining === 1 ? "" : "s"} remaining today`
                : "No free optimizations remaining today"}
              {" | "}
              {usage.downloadsRemaining > 0
                ? `${usage.downloadsRemaining} free download${usage.downloadsRemaining === 1 ? "" : "s"} remaining today`
                : "No free downloads remaining today"}
            </p>
          )}
        </div>

        {!optimized && !loading && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">
                Ready to Optimize?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our AI will analyze your resume against the job description and rewrite
                sections to naturally integrate missing keywords.
              </p>
              {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
              )}
              {canOptimize ? (
                <Button size="lg" onClick={handleOptimize}>
                  Optimize My Resume
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button size="lg" variant="default">
                    <Crown className="mr-2 h-4 w-4" /> Upgrade to Continue
                  </Button>
                </Link>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                {usage?.isPro
                  ? "Pro plan - Unlimited optimizations"
                  : `${usage?.optimizesRemaining ?? 3}/3 free optimizations remaining today`}
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Optimizing...</h2>
              <p className="text-muted-foreground">
                AI is rewriting your resume. This may take 10-30 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {optimized && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="font-medium">
                  Optimization complete! Review the changes below.
                </p>
              </CardContent>
            </Card>

            {/* Optimized Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Professional Summary
                  <Badge variant="secondary">Rewritten</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                  {optimized.summary}
                </p>
              </CardContent>
            </Card>

            {/* Optimized Experience */}
            {optimized.experience?.map((exp, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {exp.company}
                    <Badge variant="secondary">Rewritten</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exp.bulletsRewritten?.map((bullet, j) => (
                      <li
                        key={j}
                        className="text-sm bg-green-50 p-3 rounded border border-green-200"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    {exp.changesExplanation}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Optimized Skills */}
            {optimized.skills && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Skills
                    <Badge variant="secondary">Reorganized</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {optimized.skills.categoriesRewritten?.map((skill, i) => (
                      <Badge key={i} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    {optimized.skills.changesExplanation}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push(`/analyze/${params.scanId}`)}
                variant="outline"
              >
                Back to Score
              </Button>
              {canDownload ? (
                <Button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                >
                  {downloadLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Download Optimized Resume
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button>
                    <Crown className="mr-2 h-4 w-4" /> Upgrade to Download
                  </Button>
                </Link>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
