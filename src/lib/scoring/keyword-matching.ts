import type { ScoringCheckResult, KeywordMatch } from "@/types";

// Common English stop words to filter out
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "shall", "can",
  "need", "dare", "ought", "used", "this", "that", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "what", "which",
  "who", "whom", "not", "no", "nor", "so", "if", "then", "than",
  "too", "very", "just", "also", "about", "up", "out", "into",
  "over", "after", "before", "between", "under", "above", "such",
  "each", "every", "all", "both", "any", "few", "more", "most",
  "other", "some", "only", "own", "same", "work", "working",
  "experience", "ability", "able", "etc", "including", "include",
]);

export function extractKeywords(jdText: string): KeywordMatch[] {
  const words = tokenize(jdText);
  const wordFreq = new Map<string, number>();
  const bigramFreq = new Map<string, number>();

  // Count single word frequency
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  // Count bigrams
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
    }
  }

  // Combine and rank by frequency (TF-IDF simplified)
  const allKeywords: { keyword: string; frequency: number }[] = [];

  for (const [word, freq] of wordFreq) {
    if (freq >= 1) {
      allKeywords.push({ keyword: word, frequency: freq });
    }
  }

  for (const [bigram, freq] of bigramFreq) {
    if (freq >= 1) {
      // Bigrams get a boost in importance
      allKeywords.push({ keyword: bigram, frequency: freq * 1.5 });
    }
  }

  // Sort by frequency, take top 20
  allKeywords.sort((a, b) => b.frequency - a.frequency);
  const topKeywords = allKeywords.slice(0, 20);

  return topKeywords.map((kw, idx) => ({
    keyword: kw.keyword,
    found: false,
    frequency: 0,
    requiredFrequency: Math.max(1, Math.floor(kw.frequency / 2)),
    importance: idx < 7 ? "high" : idx < 14 ? "medium" : "low",
  }));
}

export function matchKeywords(
  resumeText: string,
  keywords: KeywordMatch[]
): KeywordMatch[] {
  const resumeLower = resumeText.toLowerCase();
  const resumeWords = tokenize(resumeText);
  const wordCount = new Map<string, number>();

  for (const word of resumeWords) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  return keywords.map((kw) => {
    const kwLower = kw.keyword.toLowerCase();
    const parts = kwLower.split(" ");

    let frequency = 0;
    if (parts.length === 1) {
      frequency = wordCount.get(kwLower) || 0;
    } else {
      // For bigrams, count occurrences in full text
      let idx = 0;
      while ((idx = resumeLower.indexOf(kwLower, idx)) !== -1) {
        frequency++;
        idx += kwLower.length;
      }
    }

    return {
      ...kw,
      found: frequency > 0,
      frequency,
    };
  });
}

export function checkKeywordMatching(
  resumeText: string,
  jdText: string
): { result: ScoringCheckResult; keywords: KeywordMatch[] } {
  const extracted = extractKeywords(jdText);
  const matched = matchKeywords(resumeText, extracted);

  const totalKeywords = matched.length;
  const foundCount = matched.filter((k) => k.found).length;
  const matchPercent = totalKeywords > 0 ? (foundCount / totalKeywords) * 100 : 0;

  const score = Math.round(matchPercent);

  const missingHigh = matched.filter((k) => !k.found && k.importance === "high");
  const missingMedium = matched.filter((k) => !k.found && k.importance === "medium");

  return {
    result: {
      name: "Keyword Matching",
      score,
      maxScore: 100,
      passed: matchPercent >= 70,
      details: `${foundCount} of ${totalKeywords} job description keywords found in resume (${Math.round(matchPercent)}% match).`,
      issues: [
        ...missingHigh.map((k) => ({
          type: "critical" as const,
          message: `Missing high-priority keyword: "${k.keyword}"`,
          suggestion: `Add "${k.keyword}" to your resume, ideally in your experience or skills section.`,
        })),
        ...missingMedium.map((k) => ({
          type: "warning" as const,
          message: `Missing keyword: "${k.keyword}"`,
          suggestion: `Consider adding "${k.keyword}" if it's relevant to your experience.`,
        })),
      ],
    },
    keywords: matched,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}
