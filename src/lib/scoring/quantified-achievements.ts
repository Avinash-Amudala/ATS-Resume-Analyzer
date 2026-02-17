import type { ScoringCheckResult } from "@/types";

const METRIC_PATTERNS = [
  /\d+%/g,                           // Percentages: 25%, 150%
  /\$[\d,]+(?:\.\d+)?(?:\s*[MBK])?/gi, // Dollar amounts: $50K, $1.2M
  /\d+\+/g,                          // Scale numbers: 100+, 500+
  /\d+x/gi,                          // Multipliers: 3x, 10x
  /\d{1,3}(?:,\d{3})+/g,            // Large numbers: 1,000, 50,000
  /\d+\s*(?:users|customers|clients|employees|team members|engineers)/gi,
  /\d+\s*(?:projects|applications|services|APIs|endpoints)/gi,
  /top\s+\d+%/gi,                    // Rank: top 5%, top 10%
  /\d+\s*(?:months?|years?|weeks?|days?)/gi,  // Time: 6 months, 3 years
];

export function checkQuantifiedAchievements(text: string): ScoringCheckResult {
  const allMatches = new Set<string>();

  for (const pattern of METRIC_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        allMatches.add(m);
      }
    }
  }

  const count = allMatches.size;
  let score: number;
  let label: string;

  if (count >= 16) {
    score = 95;
    label = "Excellent";
  } else if (count >= 8) {
    score = 85;
    label = "Strong";
  } else if (count >= 4) {
    score = 60;
    label = "Good";
  } else {
    score = 20;
    label = "Weak";
  }

  return {
    name: "Quantified Achievements",
    score,
    maxScore: 100,
    passed: count >= 4,
    details: `Found ${count} quantified achievement(s) - rated "${label}".`,
    issues:
      count < 4
        ? [
            {
              type: "warning",
              message: `Only ${count} metrics found. Strong resumes typically have 8+ quantified achievements.`,
              suggestion:
                'Add specific numbers to your bullets: percentages (improved by 30%), dollar amounts ($500K revenue), team sizes (led team of 8), or scale (served 10K+ users).',
            },
          ]
        : count < 8
          ? [
              {
                type: "info",
                message: `${count} metrics found. Consider adding more quantified results to strengthen your resume.`,
                suggestion:
                  "Try to include at least one metric per experience bullet point.",
              },
            ]
          : [],
  };
}
