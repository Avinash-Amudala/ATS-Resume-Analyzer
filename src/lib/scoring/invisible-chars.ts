import type { ScoringCheckResult } from "@/types";

const INVISIBLE_CHARS = /[\u200b\u200c\u200d\ufeff\u00ad\u2028\u2029\u200e\u200f\u202a-\u202e\u2060-\u2064\u2066-\u206f]/g;

export function checkInvisibleChars(text: string): ScoringCheckResult {
  const matches = text.match(INVISIBLE_CHARS) || [];
  const count = matches.length;

  const deduction = Math.min(20, Math.floor(count / 10) * 10);
  const score = Math.max(0, 100 - deduction);
  const isCritical = count > 50;

  return {
    name: "Invisible Character Detection",
    score,
    maxScore: 100,
    passed: count === 0,
    details:
      count === 0
        ? "No invisible characters found. Your resume is clean."
        : `Found ${count} invisible character(s) that may corrupt ATS parsing.`,
    issues: isCritical
      ? [
          {
            type: "critical",
            message: `CRITICAL: ${count} invisible characters detected. These can prevent ATS from reading your resume.`,
            suggestion:
              "Copy your resume text into a plain text editor, then paste it back into your document to strip invisible characters.",
          },
        ]
      : count > 0
        ? [
            {
              type: "warning",
              message: `${count} invisible character(s) found (zero-width spaces, soft hyphens, etc.).`,
              suggestion:
                "Open your resume in a plain text editor to identify and remove hidden characters.",
            },
          ]
        : [],
  };
}
