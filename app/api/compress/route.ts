import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import formidable, { Fields, Files, File } from "formidable";
import { readFile } from "fs/promises";

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
    const form = formidable({ multiples: true, maxFileSize: 50 * 1024 * 1024, maxFiles: 10 });
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) {
      return new NextResponse(JSON.stringify({ error: "No PDF file uploaded" }), { status: 400 });
    }
    const file = pdfFiles[0];
    if (!file.mimetype?.includes("pdf")) {
      return new NextResponse(JSON.stringify({ error: "File must be a PDF" }), { status: 400 });
    }
    const pdfBytes = await readFile(file.filepath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // pdf-lib doesn't do real compression, but we can resave (removes unused objects)
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    return new NextResponse(Buffer.from(compressedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=compressed.pdf",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message || "Unknown error" }), { status: 500 });
  }
} 