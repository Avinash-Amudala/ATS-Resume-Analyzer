import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Search, Zap, Shield, BarChart3, Download,
  CheckCircle, ArrowRight, Star, Building2, Brain, Eye,
  Clock, TrendingUp, Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by 50,000+ job seekers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stop Getting Rejected by{" "}
            <span className="text-blue-600">ATS Systems</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            75% of resumes are filtered out before a human ever sees them.
            Our AI analyzes your resume against real ATS algorithms and optimizes it to pass.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Analyze My Resume Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            3 free scans, downloads &amp; AI optimizations per day. No credit card required.
          </p>
        </div>
      </section>

      {/* Company ATS Detection - HIGHLIGHT FEATURE */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50 border-y border-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-purple-600 mb-4">Smart ATS Detection</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  We Know Which ATS{" "}
                  <span className="text-purple-600">Your Target Company Uses</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Just paste the job description. Our system automatically detects the company
                  and identifies their exact ATS system — whether it&apos;s Greenhouse, Workday,
                  Lever, Taleo, or others. We then tailor your score and recommendations
                  to match that specific ATS.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-semibold">50+ Companies in Our Database</p>
                      <p className="text-sm text-muted-foreground">
                        Google, Amazon, Meta, Apple, Netflix, Microsoft, and more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-semibold">8 ATS Systems Mapped</p>
                      <p className="text-sm text-muted-foreground">
                        Greenhouse, Lever, Workday, Taleo, iCIMS, SuccessFactors, Ashby, BambooHR
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-semibold">Company-Specific Tips</p>
                      <p className="text-sm text-muted-foreground">
                        Get tailored advice for each company&apos;s unique ATS parsing rules
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <p className="font-semibold text-purple-800">Company Detected: Google</p>
                    </div>
                    <p className="text-sm text-purple-700">
                      Uses <strong>Greenhouse</strong> ATS (semantic parsing)
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-2">ATS-Specific Tips:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-700 flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5" />
                        Use standard section headers
                      </p>
                      <p className="text-xs text-blue-700 flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5" />
                        PDF format preferred
                      </p>
                      <p className="text-xs text-blue-700 flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5" />
                        Include measurable impact metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-800">ATS Score</span>
                    <span className="text-2xl font-bold text-emerald-600">87/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "1. Upload Resume", desc: "Upload your PDF or DOCX resume" },
              { icon: Search, title: "2. Paste Job Description", desc: "Add the job posting you're targeting" },
              { icon: BarChart3, title: "3. Get ATS Score", desc: "See your score, company ATS info, and exactly what to fix" },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            10 ATS Compatibility Checks
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We run the same checks real ATS systems use to score your resume
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Invisible Character Detection", desc: "Find hidden characters that corrupt ATS parsing" },
              { icon: Search, title: "Keyword Matching", desc: "Match your resume against job description keywords using TF-IDF" },
              { icon: FileText, title: "Section Header Recognition", desc: "Ensure ATS can identify your resume sections" },
              { icon: BarChart3, title: "Quantified Achievements", desc: "Score your use of metrics and data points" },
              { icon: Zap, title: "Special Character Audit", desc: "Detect characters that break ATS parsers" },
              { icon: Clock, title: "Date Format Consistency", desc: "Verify consistent date formatting throughout" },
              { icon: Building2, title: "Company ATS Detection", desc: "Auto-detect which ATS system the target company uses" },
              { icon: Eye, title: "Contact Info Validation", desc: "Verify phone, email, LinkedIn & portfolio are parseable" },
              { icon: Globe, title: "File Format Check", desc: "Ensure your file type & encoding won't cause parsing errors" },
              { icon: Brain, title: "Summary Alignment", desc: "Check if your professional summary matches the job description" },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">50K+</p>
              <p className="text-sm text-muted-foreground mt-1">Resumes Analyzed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">95%</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Score After Optimization</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">50+</p>
              <p className="text-sm text-muted-foreground mt-1">Companies Mapped</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">8</p>
              <p className="text-sm text-muted-foreground mt-1">ATS Systems Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">
            Start free, upgrade when you need more
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-1">Free</h3>
                <p className="text-3xl font-bold mb-4">$0</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 3 scans per day</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 3 downloads per day</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 3 AI optimizations per day</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Top 10 missing keywords</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Company ATS detection</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> ATS score breakdown</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-600 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600">Most Popular</Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-1">Pro Monthly</h3>
                <p className="text-3xl font-bold mb-4">$15<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Unlimited scans</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Unlimited downloads</li>
                  <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Unlimited AI optimization</li>
                  <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> All missing keywords</li>
                  <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> 8 FAANG templates</li>
                  <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Cover letter generator</li>
                  <li className="flex items-center gap-2"><Download className="h-4 w-4 text-blue-500" /> DOCX/PDF exports</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-1">Lifetime</h3>
                <p className="text-3xl font-bold mb-4">$299</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> One-time payment</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> All future features</li>
                  <li className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="outline">View Full Pricing Details</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Beat the ATS?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who boosted their ATS scores from 40% to 95%
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
