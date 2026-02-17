import type { ScoringCheckResult, ScoringIssue } from "@/types";

const PHONE_REGEX = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
const EMAIL_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;
// Match LinkedIn with or without protocol, with or without www
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-z0-9_-]+\/?/i;
// Match any URL (with or without protocol)
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,)]*)?/i;
const LOCATION_REGEX = /[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2}/;
// Match GitHub profiles specifically
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-z0-9_-]+\/?/i;

export function checkContactInfo(text: string): ScoringCheckResult {
  // Check top 20 lines (some resumes have contact info spread across more lines)
  const topLines = text.split("\n").slice(0, 20).join(" ");
  // Also check the full text for URLs that might be in a separate section
  const fullText = text;
  const issues: ScoringIssue[] = [];
  let fieldsFound = 0;
  const totalFields = 5;

  if (EMAIL_REGEX.test(topLines)) {
    fieldsFound++;
  } else {
    issues.push({
      type: "critical",
      message: "No email address found in resume header.",
      suggestion: "Add your professional email address near the top of your resume.",
    });
  }

  if (PHONE_REGEX.test(topLines)) {
    fieldsFound++;
  } else {
    issues.push({
      type: "warning",
      message: "No phone number detected.",
      suggestion: "Add your phone number in the contact section.",
    });
  }

  // Check for LinkedIn URL — search both header and full text
  if (LINKEDIN_REGEX.test(topLines) || LINKEDIN_REGEX.test(fullText)) {
    fieldsFound++;
  } else {
    issues.push({
      type: "warning",
      message: "No LinkedIn profile URL found.",
      suggestion: "Add your full LinkedIn URL (e.g., linkedin.com/in/yourname).",
    });
  }

  // Portfolio / website (not LinkedIn, not GitHub) — search full text
  const allUrls = fullText.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9_-]+\.[a-z]{2,}(?:\/[^\s,)]*)?/gi) || [];
  const portfolioUrls = allUrls.filter(
    (u) => {
      const lower = u.toLowerCase();
      return !lower.includes("linkedin.com") &&
             !lower.includes("github.com") &&
             !lower.includes("clerk.") &&
             !lower.includes("googleapis.") &&
             !lower.includes("google.com") &&
             lower.length > 5;
    }
  );
  const hasGithub = GITHUB_REGEX.test(topLines) || GITHUB_REGEX.test(fullText);

  if (portfolioUrls.length > 0 || hasGithub) {
    fieldsFound++;
  } else {
    issues.push({
      type: "info",
      message: "No portfolio/personal website found.",
      suggestion: "Consider adding a GitHub, portfolio, or personal website link.",
    });
  }

  if (LOCATION_REGEX.test(topLines)) {
    fieldsFound++;
  } else {
    issues.push({
      type: "info",
      message: "No location (City, State) detected.",
      suggestion: "Add your city and state (e.g., San Francisco, CA).",
    });
  }

  const deduction = (totalFields - fieldsFound) * 15;
  const score = Math.max(0, 100 - deduction);

  return {
    name: "Contact Information",
    score,
    maxScore: 100,
    passed: fieldsFound >= 3,
    details: `Found ${fieldsFound} of ${totalFields} contact fields (email, phone, LinkedIn, portfolio/GitHub, location).`,
    issues,
  };
}
