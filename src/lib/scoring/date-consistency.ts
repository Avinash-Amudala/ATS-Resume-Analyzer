import type { ScoringCheckResult, ScoringIssue } from "@/types";

// Date format patterns
const DATE_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "MMM YYYY", regex: /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi },
  { name: "Month YYYY", regex: /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi },
  { name: "MM/YYYY", regex: /\d{1,2}\/\d{4}/g },
  { name: "YYYY-MM", regex: /\d{4}-\d{2}/g },
  { name: "MM-YYYY", regex: /\d{1,2}-\d{4}/g },
  { name: "YYYY", regex: /(?<!\d)\d{4}(?!\d)/g },
];

export function checkDateConsistency(text: string): ScoringCheckResult {
  const issues: ScoringIssue[] = [];
  const formatsFound = new Map<string, number>();

  for (const pattern of DATE_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      formatsFound.set(pattern.name, matches.length);
    }
  }

  // Remove standalone YYYY if other formats exist (they're subsets)
  if (formatsFound.size > 1 && formatsFound.has("YYYY")) {
    formatsFound.delete("YYYY");
  }

  const formatCount = formatsFound.size;
  let score: number;

  if (formatCount <= 1) {
    score = 100;
  } else if (formatCount === 2) {
    score = 70;
  } else {
    score = 40;
  }

  if (formatCount > 1) {
    const formatList = Array.from(formatsFound.entries())
      .map(([name, count]) => `${name} (${count} occurrences)`)
      .join(", ");

    issues.push({
      type: formatCount > 2 ? "critical" : "warning",
      message: `Inconsistent date formats found: ${formatList}`,
      suggestion:
        'Pick one date format and use it throughout. Recommended: "MMM YYYY" (e.g., "Jan 2024 - Present").',
    });
  }

  // Check for "Present" or "Current" consistency
  const presentCount = (text.match(/present/gi) || []).length;
  const currentCount = (text.match(/current/gi) || []).length;
  if (presentCount > 0 && currentCount > 0) {
    score = Math.max(0, score - 10);
    issues.push({
      type: "warning",
      message: 'Inconsistent end-date terminology: using both "Present" and "Current".',
      suggestion: 'Pick either "Present" or "Current" and use it consistently.',
    });
  }

  return {
    name: "Date Consistency",
    score,
    maxScore: 100,
    passed: formatCount <= 1,
    details:
      formatCount <= 1
        ? "Date formats are consistent throughout your resume."
        : `${formatCount} different date formats detected. ATS systems parse dates better when formatting is consistent.`,
    issues,
  };
}
