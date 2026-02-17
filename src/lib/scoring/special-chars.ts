import type { ScoringCheckResult, ScoringIssue } from "@/types";

const SPECIAL_CHAR_PATTERNS: {
  name: string;
  regex: RegExp;
  replacement: string;
}[] = [
  { name: "en-dash", regex: /–/g, replacement: "-" },
  { name: "em-dash", regex: /—/g, replacement: "-" },
  { name: "arrow (→)", regex: /[→⇒←⇐↑↓]/g, replacement: "->" },
  { name: "fancy bullet (•)", regex: /[•◆◇■□▪▫●○]/g, replacement: "-" },
  { name: "curly quote", regex: /[\u201c\u201d\u2018\u2019]/g, replacement: '"' },
  { name: "ellipsis (…)", regex: /…/g, replacement: "..." },
  { name: "non-breaking space", regex: /\u00a0/g, replacement: " " },
  { name: "trademark/copyright", regex: /[™®©]/g, replacement: "" },
];

export function checkSpecialChars(text: string): ScoringCheckResult {
  const issues: ScoringIssue[] = [];
  let totalInstances = 0;

  for (const pattern of SPECIAL_CHAR_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      totalInstances += matches.length;
      issues.push({
        type: "warning",
        message: `Found ${matches.length} ${pattern.name} character(s).`,
        suggestion: `Replace ${pattern.name} with "${pattern.replacement}" for better ATS compatibility.`,
      });
    }
  }

  const deduction = Math.min(30, totalInstances * 2);
  const score = Math.max(0, 100 - deduction);

  return {
    name: "Special Characters",
    score,
    maxScore: 100,
    passed: totalInstances === 0,
    details:
      totalInstances === 0
        ? "No problematic special characters found."
        : `Found ${totalInstances} special character(s) that some ATS systems cannot parse correctly.`,
    issues,
  };
}
