import fs from "fs";
import path from "path";

export async function parseFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      // PPTX files are ZIP archives with XML inside.
      // Without a dedicated PPTX parser we can only offer limited support.
      try {
        const buffer = fs.readFileSync(filePath);
        const text = buffer.toString("utf-8");
        // Try to extract readable text fragments
        const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
        if (readable.length > 50) {
          return readable;
        }
      } catch {
        // Ignore extraction errors
      }
      return "[Text extraction from PPTX has limited support. Consider uploading the content as a PDF or DOCX instead.]";
    }

    if (mimeType === "image/jpeg" || mimeType === "image/png") {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      const ext = mimeType === "image/jpeg" ? "jpg" : "png";
      return `[Image uploaded - will be processed by AI vision]\nBASE64_IMAGE:data:${mimeType};base64,${base64}`;
    }

    // Plain text and other text-based formats
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml"
    ) {
      return fs.readFileSync(filePath, "utf-8");
    }

    return `[Unsupported file type: ${mimeType}. Please upload a PDF, DOCX, or image file.]`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during parsing";
    console.error(`File parsing error for ${path.basename(filePath)}:`, message);
    return `[Error parsing file: ${message}. Partial text may be unavailable.]`;
  }
}
