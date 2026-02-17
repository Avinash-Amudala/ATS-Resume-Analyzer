import type { ScoringCheckResult } from "@/types";

const SUMMARY_HEADERS = [
  "professional summary", "summary", "profile", "objective",
  "career objective", "about me", "about",
];

export function checkSummaryAlignment(
  resumeText: string,
  jdKeywords: string[]
): ScoringCheckResult {
  const summaryText = extractSummarySection(resumeText);

  if (!summaryText) {
    return {
      name: "Summary Alignment",
      score: 30,
      maxScore: 100,
      passed: false,
      details: "No professional summary section detected.",
      issues: [
        {
          type: "warning",
          message: "Missing professional summary.",
          suggestion:
            "Add a 2-3 sentence professional summary at the top of your resume that highlights your key qualifications.",
        },
      ],
    };
  }

  // Check top 10 JD keywords against summary
  const top10 = jdKeywords.slice(0, 10);
  const summaryLower = summaryText.toLowerCase();
  let matched = 0;

  for (const kw of top10) {
    if (summaryLower.includes(kw.toLowerCase())) {
      matched++;
    }
  }

  const matchPercent =
    top10.length > 0 ? (matched / top10.length) * 100 : 0;

  let score: number;
  if (matchPercent >= 86) score = 95;
  else if (matchPercent >= 61) score = 80;
  else if (matchPercent >= 31) score = 60;
  else score = 30;

  const missing = top10.filter(
    (kw) => !summaryLower.includes(kw.toLowerCase())
  );

  return {
    name: "Summary Alignment",
    score,
    maxScore: 100,
    passed: matchPercent >= 60,
    details: `Your summary matches ${matched} of ${top10.length} top job description keywords (${Math.round(matchPercent)}%).`,
    issues:
      missing.length > 0
        ? [
            {
              type: matchPercent < 31 ? "critical" : "warning",
              message: `Summary is missing key terms: ${missing.map((k) => `"${k}"`).join(", ")}`,
              suggestion:
                "Revise your professional summary to include the most important keywords from the job description.",
            },
          ]
        : [],
  };
}

function extractSummarySection(text: string): string | null {
  const lines = text.split("\n");
  let inSummary = false;
  const summaryLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    if (
      SUMMARY_HEADERS.some(
        (h) => trimmed === h || trimmed.startsWith(h)
      )
    ) {
      inSummary = true;
      continue;
    }

    if (inSummary) {
      // Stop at next section header (ALL CAPS line or empty line after content)
      if (
        line.trim() === line.trim().toUpperCase() &&
        line.trim().length > 2 &&
        summaryLines.length > 0
      ) {
        break;
      }
      if (line.trim().length > 0) {
        summaryLines.push(line);
      } else if (summaryLines.length > 0) {
        break;
      }
    }
  }

  return summaryLines.length > 0 ? summaryLines.join(" ") : null;
}
