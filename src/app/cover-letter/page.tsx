"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download } from "lucide-react";

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<{ id: string; name: string }[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jdText, setJdText] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResumes(data.data);
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedResume || !jdText) {
      setError("Please select a resume and enter a job description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResume,
          jdText,
          tone,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate cover letter.");
        return;
      }

      setCoverLetter(data.data.content);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cover Letter Generator</h1>
          <p className="text-muted-foreground">
            AI-generated cover letters tailored to your resume and job description
          </p>
          <Badge variant="secondary" className="mt-2">Pro Feature</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Resume</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Job Description</Label>
                <Textarea
                  placeholder="Paste the job description..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="min-h-[150px] mt-1"
                />
              </div>

              <div>
                <Label>Tone</Label>
                <div className="flex gap-2 mt-1">
                  {["professional", "conversational", "bold"].map((t) => (
                    <Button
                      key={t}
                      variant={tone === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTone(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Cover Letter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <>
                  <div className="bg-white p-4 rounded-lg border min-h-[300px] text-sm whitespace-pre-wrap">
                    {coverLetter}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" /> Download as DOCX
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                  <p>Your cover letter will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
