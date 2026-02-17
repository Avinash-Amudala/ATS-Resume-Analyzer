"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ads/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle, XCircle, AlertTriangle, Zap, Loader2,
  ArrowRight, Building2, Crown, Info
} from "lucide-react";
import type { ScoringCheckResult, KeywordMatch } from "@/types";

interface UsageInfo {
  scansUsed: number;
  scansLimit: number | "unlimited";
  downloadsUsed: number;
  downloadsLimit: number | "unlimited";
  optimizesUsed: number;
  optimizesLimit: number | "unlimited";
  isPro: boolean;
}

interface ScanData {
  scanId: string;
  resumeId: string;
  totalScore: number;
  checks: ScoringCheckResult[];
  missingKeywords: KeywordMatch[];
  formattingIssues: { type: string; message: string; suggestion?: string }[];
  detectedCompany?: string | null;
  detectedAts?: string | null;
  atsTips?: string[];
  usage?: UsageInfo;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch scan data and subscription info in parallel
        const [scanRes, subRes] = await Promise.all([
          fetch(`/api/scan?id=${params.scanId}`),
          fetch("/api/subscription"),
        ]);
        const scanJson = await scanRes.json();
        const subJson = await subRes.json();

        if (scanJson.success && scanJson.data) {
          const scan = scanJson.data;
          setData({
            scanId: scan.id,
            resumeId: scan.resumeId,
            totalScore: scan.scoreTotal,
            checks: scan.scoreBreakdown ? JSON.parse(scan.scoreBreakdown) : [],
            missingKeywords: scan.missingKeywords ? JSON.parse(scan.missingKeywords) : [],
            formattingIssues: [],
            detectedCompany: scan.jdCompany,
            detectedAts: scan.detectedAts,
            usage: scan.usage,
          });
        }

        if (subJson.success && subJson.data) {
          setUsage({
            scansUsed: subJson.data.usage.scans.used,
            scansLimit: subJson.data.isPro ? "unlimited" : subJson.data.usage.scans.limit,
            downloadsUsed: subJson.data.usage.downloads.used,
            downloadsLimit: subJson.data.isPro ? "unlimited" : subJson.data.usage.downloads.limit,
            optimizesUsed: subJson.data.usage.optimizations.used,
            optimizesLimit: subJson.data.isPro ? "unlimited" : subJson.data.usage.optimizations.limit,
            isPro: subJson.data.isPro,
          });
        }
      } catch {
        // Error loading scan
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.scanId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Scan not found.</p>
      </div>
    );
  }

  const scoreColor =
    data.totalScore >= 90
      ? "text-emerald-500"
      : data.totalScore >= 70
        ? "text-amber-500"
        : "text-red-500";

  const optimizesRemaining = usage && !usage.isPro && typeof usage.optimizesLimit === "number"
    ? Math.max(0, usage.optimizesLimit - usage.optimizesUsed)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Your ATS Score</h1>
                    <p className="text-muted-foreground">
                      Based on 10 compatibility checks
                    </p>
                  </div>
                  <div className={`text-6xl font-bold ${scoreColor}`}>
                    {data.totalScore}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                </div>
                <Progress value={data.totalScore} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {data.totalScore >= 90
                    ? "Excellent! Your resume is highly ATS-compatible."
                    : data.totalScore >= 70
                      ? "Good, but there's room for improvement."
                      : "Your resume needs optimization to pass ATS filters."}
                </p>
              </CardContent>
            </Card>

            {/* ATS Company Detection Card */}
            {data.detectedCompany && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Company Detected: {data.detectedCompany}
                      </h3>
                      {data.detectedAts && (
                        <p className="text-sm text-purple-700 mb-2">
                          This company uses <strong>{data.detectedAts}</strong> as their ATS system.
                          We've tailored your scoring to match their specific requirements.
                        </p>
                      )}
                      {data.atsTips && data.atsTips.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm font-semibold text-purple-800">Company-specific tips:</p>
                          {data.atsTips.map((tip, i) => (
                            <p key={i} className="text-sm text-purple-700 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Banner for free users */}
            {usage && !usage.isPro && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Free Plan Usage Today:
                      </span>
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        {usage.scansUsed}/3 Scans
                      </Badge>
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        {usage.downloadsUsed}/3 Downloads
                      </Badge>
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        {usage.optimizesUsed}/3 AI Optimizations
                      </Badge>
                    </div>
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100">
                        <Crown className="h-3 w-3 mr-1" /> Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.checks.map((check, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {check.passed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : check.score >= 50 ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{check.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{check.score}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7 mb-1">
                      {check.details}
                    </p>
                    {check.issues.length > 0 && (
                      <div className="ml-7 space-y-1">
                        {check.issues.slice(0, 2).map((issue, j) => (
                          <div
                            key={j}
                            className={`text-xs p-2 rounded ${
                              issue.type === "critical"
                                ? "bg-red-50 text-red-700"
                                : issue.type === "warning"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {issue.message}
                            {issue.suggestion && (
                              <p className="mt-1 opacity-80">{issue.suggestion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {i < data.checks.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            {data.missingKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Missing Keywords
                    {usage && !usage.isPro && (
                      <Badge variant="secondary" className="text-xs">
                        Showing top 10 - Upgrade for all
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.missingKeywords.map((kw, i) => (
                      <Badge
                        key={i}
                        variant={
                          kw.importance === "high"
                            ? "destructive"
                            : kw.importance === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {kw.keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    These keywords appear in the job description but are missing from your resume.
                  </p>
                  {usage && !usage.isPro && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <Crown className="h-4 w-4 inline mr-1" />
                        <strong>Pro users</strong> see all missing keywords plus AI-powered suggestions for adding them naturally.{" "}
                        <Link href="/pricing" className="underline font-semibold">Upgrade now</Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Optimize CTA */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  AI-Optimize Your Resume
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Let AI automatically rewrite your resume to include missing keywords
                  and boost your score to 95+.
                </p>
                {usage && !usage.isPro && (
                  <p className="text-xs text-blue-700 mb-3 font-medium">
                    {optimizesRemaining !== null && optimizesRemaining > 0
                      ? `${optimizesRemaining} free optimization${optimizesRemaining === 1 ? "" : "s"} left today`
                      : optimizesRemaining === 0
                        ? "No free optimizations left today"
                        : ""}
                  </p>
                )}
                {optimizesRemaining === 0 ? (
                  <Link href="/pricing">
                    <Button className="w-full" variant="default">
                      <Crown className="mr-2 h-4 w-4" /> Upgrade to Optimize
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/optimize/${data.scanId}`}>
                    <Button className="w-full">
                      Optimize with AI <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Pro Upgrade Card - only for free users */}
            {usage && !usage.isPro && (
              <Card className="border-gradient bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <Crown className="h-8 w-8 text-yellow-300 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Go Pro</h3>
                  <ul className="text-sm space-y-2 mb-4 opacity-90">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> Unlimited scans
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> Unlimited downloads
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> Unlimited AI optimizations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> All missing keywords
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> 8 FAANG templates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" /> Cover letter generator
                    </li>
                  </ul>
                  <Link href="/pricing">
                    <Button variant="secondary" className="w-full font-bold">
                      Upgrade for $15/mo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Ad Space (free users) */}
            <AdBanner slot="results-sidebar" format="rectangle" />

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/analyze")}
                >
                  Scan Another Resume
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
