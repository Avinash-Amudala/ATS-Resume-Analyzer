"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, AlertCircle, Building2 } from "lucide-react";

interface CompanySuggestion {
  id: number;
  companyName: string;
  atsSystem: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const companyInputRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyInputRef.current && !companyInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced company search
  const searchCompanies = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 2) {
      setCompanySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ats/companies?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCompanySuggestions(data.data);
          setShowSuggestions(true);
        } else {
          setCompanySuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setCompanySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  const handleCompanyChange = (value: string) => {
    setCompanyName(value);
    searchCompanies(value);
  };

  const selectCompany = (company: CompanySuggestion) => {
    setCompanyName(company.companyName);
    setShowSuggestions(false);
    setCompanySuggestions([]);
  };

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
      formData.append("companyName", companyName);

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

        {/* Company Name (Optional) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              3. Company Name (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={companyInputRef} className="relative">
              <Input
                placeholder="e.g., Google, Amazon, Microsoft..."
                value={companyName}
                onChange={(e) => handleCompanyChange(e.target.value)}
                onFocus={() => {
                  if (companySuggestions.length > 0) setShowSuggestions(true);
                }}
              />
              {showSuggestions && companySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {companySuggestions.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center justify-between text-sm"
                      onClick={() => selectCompany(company)}
                    >
                      <span className="font-medium">{company.companyName}</span>
                      <span className="text-muted-foreground text-xs">
                        ATS: {company.atsSystem}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Help us detect the exact ATS system. If not found, we&apos;ll add it to our database.
            </p>
          </CardContent>
        </Card>

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
