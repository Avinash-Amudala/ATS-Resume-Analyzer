// Structured resume data
export interface ResumeContact {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
}

export interface ResumeExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
}

export interface StructuredResume {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: string[];
  rawText: string;
}

// ATS Scoring
export interface ScoringCheckResult {
  name: string;
  score: number; // 0-100
  maxScore: number;
  passed: boolean;
  details: string;
  issues: ScoringIssue[];
}

export interface ScoringIssue {
  type: "critical" | "warning" | "info";
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ATSScoreResult {
  totalScore: number;
  checks: ScoringCheckResult[];
  missingKeywords: KeywordMatch[];
  formattingIssues: ScoringIssue[];
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  frequency: number;
  requiredFrequency: number;
  importance: "high" | "medium" | "low";
}

// AI Optimization
export interface OptimizationResult {
  summary: string;
  experience: {
    company: string;
    bulletsRewritten: string[];
    changesExplanation: string;
  }[];
  skills: {
    categoriesRewritten: string[];
    changesExplanation: string;
  };
  modelUsed: string;
  tokensUsed: { prompt: number; completion: number };
}

export interface CoverLetterResult {
  content: string;
  tone: "professional" | "conversational" | "bold";
  modelUsed: string;
}

// Template
export interface TemplateStyleConfig {
  font: { name: string; size: number };
  headingFont: { name: string; size: number; bold: boolean };
  colors: { heading: string; body: string; secondary: string };
  margins: { top: number; bottom: number; left: number; right: number };
  spacing: { beforeSection: number; afterSection: number; lineHeight: number };
  sectionOrder: string[];
  bulletStyle: string;
  dateFormat: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// User plan types
export type UserPlan = "free" | "pro" | "lifetime";

export interface UserWithPlan {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  scansToday: number;
}
