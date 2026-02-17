import type { ScoringCheckResult, ScoringIssue } from "@/types";

const SPAM_THRESHOLD = 0.03; // 3%

export function checkKeywordDensity(
  resumeText: string,
  jdKeywords: string[]
): ScoringCheckResult {
  const words = resumeText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      name: "Keyword Density",
      score: 100,
      maxScore: 100,
      passed: true,
      details: "No text to analyze.",
      issues: [],
    };
  }

  const issues: ScoringIssue[] = [];
  let spamCount = 0;

  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  for (const keyword of jdKeywords) {
    const kw = keyword.toLowerCase();
    const count = wordFreq.get(kw) || 0;
    const density = count / totalWords;

    if (density > SPAM_THRESHOLD) {
      spamCount++;
      issues.push({
        type: "warning",
        message: `"${keyword}" appears ${count} times (${(density * 100).toFixed(1)}% density) - exceeds 3% threshold.`,
        suggestion: `Reduce usage of "${keyword}" to avoid ATS spam filters. Use synonyms or variations instead.`,
      });
    }
  }

  const deduction = Math.min(45, spamCount * 15);
  const score = Math.max(0, 100 - deduction);

  return {
    name: "Keyword Density",
    score,
    maxScore: 100,
    passed: spamCount === 0,
    details:
      spamCount === 0
        ? "No keyword stuffing detected. Keyword density is within healthy ranges."
        : `${spamCount} keyword(s) exceed the 3% density threshold, which may trigger spam filters.`,
    issues,
  };
}
