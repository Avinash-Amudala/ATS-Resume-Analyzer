"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (f: File) => {
    setError("");
    const maxSize = 5 * 1024 * 1024;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (f.size > maxSize) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    if (!validTypes.includes(f.type) && !f.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      setError("Unsupported format. Please upload PDF, DOCX, DOC, or TXT.");
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume file.");
      return;
    }
    if (jdText.trim().length < 50) {
      setError("Please enter a job description (at least 50 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jdText", jdText);

      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      router.push(`/analyze/${data.data.scanId}`);
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
          <h1 className="text-3xl font-bold mb-2">Analyze Your Resume</h1>
          <p className="text-muted-foreground">
            Upload your resume and paste the job description to get your ATS score
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Upload Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : file
                      ? "border-green-500 bg-green-50"
                      : "border-slate-300 hover:border-blue-400"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOCX, DOC, TXT (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* JD Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Paste Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the full job description here...&#10;&#10;Include the role title, responsibilities, requirements, and preferred qualifications."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-[220px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {jdText.length} characters
                {jdText.length > 0 && jdText.length < 50 && " (minimum 50)"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="px-12"
            onClick={handleAnalyze}
            disabled={loading || !file || jdText.length < 50}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
