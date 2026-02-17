import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/x-pdf"
  ) {
    return extractFromPdf(buffer);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractFromDocx(buffer);
  }

  if (mimeType === "text/plain" || mimeType === "text/rtf") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const data = result.text;

  if (!data || data.trim().length < 50) {
    throw new ImageOnlyPdfError(
      "This appears to be an image-only PDF. Please upload a text-based PDF or DOCX file."
    );
  }

  return data;
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value || result.value.trim().length < 50) {
    throw new Error("Could not extract text from DOCX file. The file may be corrupted.");
  }
  return result.value;
}

export class ImageOnlyPdfError extends Error {
  isImageOnlyPDF = true;
  constructor(message: string) {
    super(message);
    this.name = "ImageOnlyPdfError";
  }
}

export function detectFileType(buffer: Buffer): string | null {
  // Check magic bytes
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

export function validateFileSize(buffer: Buffer, maxSizeMB: number = 5): boolean {
  return buffer.length <= maxSizeMB * 1024 * 1024;
}
