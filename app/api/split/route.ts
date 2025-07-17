import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import formidable, { Fields, Files, File } from "formidable";
import { readFile } from "fs/promises";

export const config = { api: { bodyParser: false } };

function normalizeFiles(file: File | File[] | undefined): File[] {
  if (!file) return [];
  return Array.isArray(file) ? file : [file];
}

async function parseForm(req: NextRequest) {
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function parseRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  range.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end && i <= totalPages; i++) pages.push(i);
    } else {
      const num = Number(part);
      if (num <= totalPages) pages.push(num);
    }
  });
  return pages.map(p => p - 1).filter(p => p >= 0 && p < totalPages); // zero-based
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) throw new Error("No PDF file uploaded");
    const file = pdfFiles[0];
    if (!file.mimetype?.includes("pdf")) throw new Error("File must be a PDF");
    const pdfBytes = await readFile(file.filepath);
    const range = (fields.range as string) || "";

    const srcPdf = await PDFDocument.load(pdfBytes);
    const totalPages = srcPdf.getPageCount();
    const pageIndices = parseRange(range, totalPages);
    if (pageIndices.length === 0) throw new Error("No valid pages selected");

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    const splitBytes = await newPdf.save();

    return new NextResponse(Buffer.from(splitBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=split.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 