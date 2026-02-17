import type {
  StructuredResume,
  ResumeContact,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
} from "@/types";

const SECTION_HEADERS: Record<string, string[]> = {
  summary: [
    "professional summary", "summary", "profile", "objective",
    "career objective", "about me", "about", "personal statement",
  ],
  experience: [
    "experience", "work experience", "professional experience",
    "employment history", "work history", "relevant experience",
  ],
  education: [
    "education", "academic background", "academic history",
    "educational background", "qualifications",
  ],
  skills: [
    "skills", "technical skills", "core competencies",
    "competencies", "technologies", "tools & technologies",
    "tools and technologies", "proficiencies",
  ],
  projects: [
    "projects", "personal projects", "side projects",
    "key projects", "notable projects", "academic projects",
  ],
  certifications: [
    "certifications", "certificates", "licenses",
    "professional certifications", "credentials",
  ],
};

export function parseStructuredResume(rawText: string): StructuredResume {
  const contact = extractContact(rawText);
  const sections = splitIntoSections(rawText);

  return {
    contact,
    summary: sections.summary || "",
    experience: parseExperience(sections.experience || ""),
    education: parseEducation(sections.education || ""),
    skills: parseSkills(sections.skills || ""),
    projects: parseProjects(sections.projects || ""),
    certifications: parseCertifications(sections.certifications || ""),
    rawText,
  };
}

function extractContact(text: string): ResumeContact {
  // Check more lines (some resumes spread contact info over many lines)
  const lines = text.split("\n").slice(0, 20);
  const topText = lines.join(" ");
  const fullText = text;

  const emailMatch = topText.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  const phoneMatch = topText.match(
    /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/
  );
  // Match LinkedIn with or without protocol
  const linkedinMatch = fullText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-z0-9_-]+\/?/i
  );
  // Match GitHub
  const githubMatch = fullText.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-z0-9_-]+\/?/i
  );
  // Match other portfolio/website URLs (not LinkedIn/GitHub)
  const allUrls = fullText.match(/(?:https?:\/\/)[^\s,)]+/gi) || [];
  const portfolioUrl = allUrls.find(
    (u) => !u.toLowerCase().includes("linkedin.com") && !u.toLowerCase().includes("github.com")
  );

  const locationMatch = topText.match(
    /(?:^|\s)([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2})\b/
  );

  // Name is usually the first non-empty line
  const name = lines.find((l) => l.trim().length > 0)?.trim() || "";

  return {
    name,
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[0] || "",
    linkedin: linkedinMatch?.[0] || "",
    portfolio: portfolioUrl || githubMatch?.[0] || "",
    location: locationMatch?.[1] || "",
  };
}

function splitIntoSections(text: string): Record<string, string> {
  const lines = text.split("\n");
  const sections: Record<string, string> = {};
  let currentSection = "header";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionKey = detectSectionHeader(trimmed);

    if (sectionKey) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      currentSection = sectionKey;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return sections;
}

function detectSectionHeader(line: string): string | null {
  const normalized = line.toLowerCase().replace(/[^a-z\s&]/g, "").trim();
  if (normalized.length === 0 || normalized.length > 50) return null;

  for (const [key, headers] of Object.entries(SECTION_HEADERS)) {
    for (const header of headers) {
      if (normalized === header || normalized.startsWith(header)) {
        return key;
      }
    }
  }

  // Fuzzy match: if line is ALL CAPS and short, it might be a section header
  if (line === line.toUpperCase() && line.trim().length > 2 && line.trim().length < 40) {
    const lower = normalized;
    for (const [key, headers] of Object.entries(SECTION_HEADERS)) {
      for (const header of headers) {
        if (similarity(lower, header) > 0.8) {
          return key;
        }
      }
    }
  }

  return null;
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const editDist = levenshteinDistance(longer, shorter);
  return (longer.length - editDist) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function parseExperience(text: string): ResumeExperience[] {
  if (!text) return [];
  const entries: ResumeExperience[] = [];
  const blocks = text.split(/\n(?=[A-Z])/);

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;

    const dateMatch = lines[0]?.match(
      /(\w+\.?\s+\d{4})\s*[-–—]\s*(\w+\.?\s+\d{4}|present|current)/i
    ) || lines[1]?.match(
      /(\w+\.?\s+\d{4})\s*[-–—]\s*(\w+\.?\s+\d{4}|present|current)/i
    );

    entries.push({
      company: lines[0]?.trim() || "",
      title: lines[1]?.trim() || "",
      startDate: dateMatch?.[1] || "",
      endDate: dateMatch?.[2] || "",
      bullets: lines.slice(2).filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-") || l.trim().startsWith("●")),
    });
  }

  return entries;
}

function parseEducation(text: string): ResumeEducation[] {
  if (!text) return [];
  const entries: ResumeEducation[] = [];
  const blocks = text.split(/\n(?=[A-Z])/);

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;

    const dateMatch = block.match(
      /(\w+\.?\s+\d{4})\s*[-–—]\s*(\w+\.?\s+\d{4}|present|current|expected\s+\w+\s+\d{4})/i
    );
    const gpaMatch = block.match(/GPA[:\s]*([\d.]+)/i);

    entries.push({
      institution: lines[0]?.trim() || "",
      degree: lines[1]?.trim() || "",
      field: "",
      startDate: dateMatch?.[1] || "",
      endDate: dateMatch?.[2] || "",
      gpa: gpaMatch?.[1],
    });
  }

  return entries;
}

function parseSkills(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[,\n•●|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 100);
}

function parseProjects(text: string): ResumeProject[] {
  if (!text) return [];
  const blocks = text.split(/\n(?=[A-Z])/);
  const projects: ResumeProject[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;

    projects.push({
      name: lines[0]?.trim() || "",
      description: lines[1]?.trim() || "",
      technologies: [],
      bullets: lines.slice(1).filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-")),
    });
  }

  return projects;
}

function parseCertifications(text: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.replace(/^[•●-]\s*/, "").trim())
    .filter((l) => l.length > 0);
}
