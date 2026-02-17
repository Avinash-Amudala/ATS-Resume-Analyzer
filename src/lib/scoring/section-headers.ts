import type { ScoringCheckResult, ScoringIssue } from "@/types";

const RECOGNIZED_HEADERS = [
  "professional summary", "summary", "profile", "objective",
  "experience", "work experience", "professional experience", "employment",
  "education", "academic background",
  "skills", "technical skills", "core competencies", "competencies",
  "projects", "personal projects", "key projects",
  "certifications", "certificates", "licenses",
  "publications", "patents",
  "awards", "honors",
  "volunteer", "volunteering",
  "interests", "activities",
  "references",
];

export function checkSectionHeaders(text: string): ScoringCheckResult {
  const lines = text.split("\n");
  const issues: ScoringIssue[] = [];
  let unrecognized = 0;
  const detectedHeaders: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (isPotentialHeader(trimmed)) {
      const normalized = trimmed.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      const isRecognized = RECOGNIZED_HEADERS.some(
        (h) => normalized === h || normalized.startsWith(h) || fuzzyMatch(normalized, h) > 0.8
      );

      if (isRecognized) {
        detectedHeaders.push(trimmed);
      } else {
        unrecognized++;
        issues.push({
          type: "warning",
          message: `Unrecognized header: "${trimmed}"`,
          suggestion: `ATS systems may not parse this correctly. Consider renaming to a standard header like "Experience", "Education", or "Skills".`,
        });
      }
    }
  }

  // Check for essential sections
  const essentialSections = ["experience", "education", "skills"];
  for (const section of essentialSections) {
    const found = detectedHeaders.some(
      (h) => h.toLowerCase().includes(section)
    );
    if (!found) {
      issues.push({
        type: "warning",
        message: `Missing essential section: "${section}".`,
        suggestion: `Add a clearly labeled "${section.charAt(0).toUpperCase() + section.slice(1)}" section to your resume.`,
      });
    }
  }

  const deduction = Math.min(30, unrecognized * 5);
  const score = Math.max(0, 100 - deduction);

  return {
    name: "Section Headers",
    score,
    maxScore: 100,
    passed: unrecognized === 0,
    details: `Detected ${detectedHeaders.length} recognized section headers. ${unrecognized} unrecognized header(s).`,
    issues,
  };
}

function isPotentialHeader(line: string): boolean {
  if (line.length === 0 || line.length > 60) return false;
  // Headers are often ALL CAPS, bold-like, or short standalone lines
  if (line === line.toUpperCase() && line.length > 2) return true;
  // Or lines that are short and don't contain typical sentence structures
  if (line.length < 40 && !line.includes(".") && !line.includes(",")) return true;
  return false;
}

function fuzzyMatch(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  return matches / longer.length;
}
