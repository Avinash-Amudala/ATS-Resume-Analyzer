import type { ScoringCheckResult, ScoringIssue } from "@/types";

const PHONE_REGEX = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
const EMAIL_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const LINKEDIN_REGEX = /https?:\/\/(www\.)?linkedin\.com\/in\/[a-z0-9-]+\/?/i;
const URL_REGEX = /https?:\/\/[^\s,]+/i;
const LOCATION_REGEX = /[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2}/;

export function checkContactInfo(text: string): ScoringCheckResult {
  const topLines = text.split("\n").slice(0, 15).join(" ");
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

  if (LINKEDIN_REGEX.test(topLines)) {
    fieldsFound++;
  } else {
    issues.push({
      type: "warning",
      message: "No LinkedIn profile URL found.",
      suggestion: "Add your full LinkedIn URL (e.g., linkedin.com/in/yourname).",
    });
  }

  // Portfolio / website (not LinkedIn)
  const urls = topLines.match(/https?:\/\/[^\s,]+/gi) || [];
  const nonLinkedinUrls = urls.filter(
    (u) => !u.toLowerCase().includes("linkedin.com")
  );
  if (nonLinkedinUrls.length > 0) {
    fieldsFound++;
  } else {
    issues.push({
      type: "info",
      message: "No portfolio/personal website found.",
      suggestion:
        "Consider adding a GitHub, portfolio, or personal website link.",
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
    details: `Found ${fieldsFound} of ${totalFields} contact fields (email, phone, LinkedIn, portfolio, location).`,
    issues,
  };
}
