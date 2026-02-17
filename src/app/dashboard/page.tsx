"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, BarChart3, Clock, Loader2 } from "lucide-react";

interface ResumeItem {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  scans: { id: string; scoreTotal: number; createdAt: string }[];
}

interface ScanItem {
  id: string;
  scoreTotal: number;
  jdCompany: string | null;
  createdAt: string;
  resume: { id: string; name: string };
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [subscription, setSubscription] = useState<{
    plan: string;
    scansToday: number;
    scansLimit: string | number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumes").then((r) => r.json()),
      fetch("/api/scan").then((r) => r.json()),
      fetch("/api/subscription").then((r) => r.json()),
    ]).then(([resumeData, scanData, subData]) => {
      if (resumeData.success) setResumes(resumeData.data);
      if (scanData.success) setScans(scanData.data);
      if (subData.success) setSubscription(subData.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/analyze">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold capitalize">
                    {subscription?.plan || "Free"}
                  </p>
                </div>
                <Badge
                  variant={subscription?.plan === "free" ? "secondary" : "default"}
                >
                  {subscription?.plan === "free" ? "Free" : "Pro"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scans Today</p>
                  <p className="text-2xl font-bold">
                    {subscription?.scansToday || 0} / {subscription?.scansLimit || 3}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                  <p className="text-2xl font-bold">{resumes.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Resumes */}
          <Card>
            <CardHeader>
              <CardTitle>My Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">No resumes yet</p>
                  <Link href="/analyze">
                    <Button size="sm">Upload Your First Resume</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.slice(0, 5).map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{resume.name}</p>
                          <p className="text-xs text-muted-foreground">
                            v{resume.version} &middot;{" "}
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {resume.scans[0] && (
                        <Badge
                          variant={
                            resume.scans[0].scoreTotal >= 80
                              ? "default"
                              : "secondary"
                          }
                        >
                          Score: {resume.scans[0].scoreTotal}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {scans.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">No scans yet</p>
                  <Link href="/analyze">
                    <Button size="sm">Run Your First Scan</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.slice(0, 5).map((scan) => (
                    <Link key={scan.id} href={`/analyze/${scan.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              {scan.resume?.name || "Resume"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            scan.scoreTotal >= 90
                              ? "text-emerald-500"
                              : scan.scoreTotal >= 70
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {scan.scoreTotal}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA for free users */}
        {subscription?.plan === "free" && (
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">Unlock AI Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for unlimited scans, AI rewriting, and FAANG templates.
                </p>
              </div>
              <Link href="/pricing">
                <Button>Upgrade to Pro</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
