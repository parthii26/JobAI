import mammoth from "mammoth";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

export async function parseResume(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    let text = "";

    switch (mimeType) {
      case "application/pdf":
        // For PDF files, we'll use a simple text extraction approach
        // In a production environment, you might want to use a more robust PDF parser
        const pdfText = buffer.toString('utf8');
        // Simple heuristic to extract readable text from PDF
        text = pdfText.replace(/[^\x20-\x7E\n]/g, ' ').trim();
        
        // If no readable text found, provide fallback
        if (!text || text.length < 50) {
          text = "This PDF contains primarily image-based content. Please upload a text-based resume or Word document for better extraction.";
        }
        break;

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docResult = await mammoth.extractRawText({ buffer });
        text = docResult.value;
        break;

      default:
        throw new Error("Unsupported file type. Please upload a PDF, DOC, or DOCX file.");
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();

    if (!text || text.length < 10) {
      throw new Error("No readable text found in the document. Please ensure the file contains text content.");
    }

    return text;
  } catch (error) {
    console.error("Error parsing resume:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse resume. Please ensure the file is not corrupted and contains readable text.");
  }
}
