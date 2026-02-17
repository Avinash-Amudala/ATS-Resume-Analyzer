import type { ScoringCheckResult } from "@/types";

export function checkFileFormat(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): ScoringCheckResult {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const sizeBytes = buffer.length;
  const sizeMB = sizeBytes / (1024 * 1024);

  // Check file size
  if (sizeMB > 5) {
    return {
      name: "File Format & Encoding",
      score: 0,
      maxScore: 100,
      passed: false,
      details: `File is ${sizeMB.toFixed(1)}MB - exceeds 5MB limit.`,
      issues: [
        {
          type: "critical",
          message: `File size (${sizeMB.toFixed(1)}MB) exceeds the 5MB limit.`,
          suggestion: "Reduce file size by compressing images or saving in a different format.",
        },
      ],
    };
  }

  // Check magic bytes
  const isPdf =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;
  const isZip =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  const acceptedExtensions = ["pdf", "docx", "doc", "txt", "rtf"];
  if (!extension || !acceptedExtensions.includes(extension)) {
    return {
      name: "File Format & Encoding",
      score: 0,
      maxScore: 100,
      passed: false,
      details: `Unsupported format: .${extension || "unknown"}`,
      issues: [
        {
          type: "critical",
          message: `Unsupported file format: .${extension || "unknown"}.`,
          suggestion: "Upload your resume as PDF, DOCX, DOC, TXT, or RTF.",
        },
      ],
    };
  }

  // Verify magic bytes match extension
  if (extension === "pdf" && !isPdf) {
    return {
      name: "File Format & Encoding",
      score: 0,
      maxScore: 100,
      passed: false,
      details: "File extension is .pdf but file content does not match PDF format.",
      issues: [
        {
          type: "critical",
          message: "Corrupted or invalid PDF file.",
          suggestion: "Re-save your resume as a valid PDF file.",
        },
      ],
    };
  }

  if (extension === "docx" && !isZip) {
    return {
      name: "File Format & Encoding",
      score: 0,
      maxScore: 100,
      passed: false,
      details: "File extension is .docx but file content does not match DOCX format.",
      issues: [
        {
          type: "critical",
          message: "Corrupted or invalid DOCX file.",
          suggestion: "Re-save your resume as a valid DOCX file.",
        },
      ],
    };
  }

  // PDF is the most ATS-compatible, DOCX is also good
  const formatScore = extension === "pdf" ? 100 : extension === "docx" ? 95 : 80;

  return {
    name: "File Format & Encoding",
    score: formatScore,
    maxScore: 100,
    passed: true,
    details: `Valid ${extension?.toUpperCase()} file (${sizeMB.toFixed(1)}MB). ${extension === "pdf" ? "PDF is the most ATS-compatible format." : ""}`,
    issues:
      extension !== "pdf" && extension !== "docx"
        ? [
            {
              type: "info",
              message: `Your resume is in .${extension} format.`,
              suggestion: "For best ATS compatibility, consider saving as PDF or DOCX.",
            },
          ]
        : [],
  };
}
