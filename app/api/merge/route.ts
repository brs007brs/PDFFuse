import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import formidable, { Fields, Files, File } from "formidable";
import { readFile } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

function normalizeFiles(file: File | File[] | undefined): File[] {
  if (!file) return [];
  return Array.isArray(file) ? file : [file];
}

async function parseForm(req: NextRequest) {
  return new Promise<{ files: Files }>((resolve, reject) => {
    const form = formidable({ multiples: true, maxFileSize: 50 * 1024 * 1024, maxFiles: 10, timeout: 30000 });
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse uploaded files
    const { files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) {
      return new NextResponse(JSON.stringify({ error: "No PDF files uploaded" }), { status: 400 });
    }
    for (const file of pdfFiles) {
      if (!file.mimetype?.includes("pdf")) {
        return new NextResponse(JSON.stringify({ error: "All files must be PDFs" }), { status: 400 });
      }
    }
    const pdfBuffers = await Promise.all(
      pdfFiles.map(async (file) => readFile(file.filepath))
    );

    // Merge PDFs
    const mergedPdf = await PDFDocument.create();
    for (const pdfBytes of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();

    return new NextResponse(Buffer.from(mergedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=merged.pdf",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message || "Unknown error" }), { status: 500 });
  }
} 