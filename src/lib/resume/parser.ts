// Polyfill DOMMatrix for Node.js (pdf-parse v2 / pdfjs-dist needs it)
if (typeof globalThis.DOMMatrix === "undefined") {
  // Minimal DOMMatrix stub — only text extraction is used, not rendering
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
    inverse() { return new DOMMatrix(); }
    multiply() { return new DOMMatrix(); }
    translate() { return new DOMMatrix(); }
    scale() { return new DOMMatrix(); }
    rotate() { return new DOMMatrix(); }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}
if (typeof globalThis.Path2D === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Path2D = class Path2D { constructor() {} } as any;
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    width: number; height: number; data: Uint8ClampedArray;
    constructor(w: number, h: number) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

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
