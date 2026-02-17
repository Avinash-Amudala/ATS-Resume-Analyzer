import type { ATSScoreResult, ScoringCheckResult, KeywordMatch, ScoringIssue } from "@/types";
import { checkInvisibleChars } from "./invisible-chars";
import { checkContactInfo } from "./contact-info";
import { checkSectionHeaders } from "./section-headers";
import { checkKeywordMatching, extractKeywords } from "./keyword-matching";
import { checkKeywordDensity } from "./keyword-density";
import { checkSpecialChars } from "./special-chars";
import { checkQuantifiedAchievements } from "./quantified-achievements";
import { checkSummaryAlignment } from "./summary-alignment";
import { checkFileFormat } from "./file-format";
import { checkDateConsistency } from "./date-consistency";

export interface ScoringInput {
  resumeText: string;
  jdText: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export function runATSScoring(input: ScoringInput): ATSScoreResult {
  const { resumeText, jdText, fileBuffer, fileName, mimeType } = input;

  // Extract keywords from JD for shared use across checks
  const jdKeywords = extractKeywords(jdText);
  const jdKeywordStrings = jdKeywords.map((k) => k.keyword);

  // Run all 10 checks
  const checks: ScoringCheckResult[] = [];

  // 1. Invisible characters
  checks.push(checkInvisibleChars(resumeText));

  // 2. Contact information
  checks.push(checkContactInfo(resumeText));

  // 3. Section headers
  checks.push(checkSectionHeaders(resumeText));

  // 4. Keyword matching
  const keywordResult = checkKeywordMatching(resumeText, jdText);
  checks.push(keywordResult.result);

  // 5. Keyword density
  checks.push(checkKeywordDensity(resumeText, jdKeywordStrings));

  // 6. Special characters
  checks.push(checkSpecialChars(resumeText));

  // 7. Quantified achievements
  checks.push(checkQuantifiedAchievements(resumeText));

  // 8. Summary alignment
  checks.push(checkSummaryAlignment(resumeText, jdKeywordStrings));

  // 9. File format validation
  checks.push(checkFileFormat(fileBuffer, fileName, mimeType));

  // 10. Date consistency
  checks.push(checkDateConsistency(resumeText));

  // Calculate total score (average of all 10 checks)
  const totalScore = Math.round(
    checks.reduce((sum, check) => sum + check.score, 0) / checks.length
  );

  // Collect all formatting issues
  const formattingIssues: ScoringIssue[] = checks.flatMap((c) => c.issues);

  // Get missing keywords
  const missingKeywords: KeywordMatch[] = keywordResult.keywords.filter(
    (k) => !k.found
  );

  return {
    totalScore,
    checks,
    missingKeywords,
    formattingIssues,
  };
}
