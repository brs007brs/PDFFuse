import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import formidable, { Fields, Files, File } from "formidable";
import { readFile } from "fs/promises";

export const config = { api: { bodyParser: false } };

function normalizeFiles(file: File | File[] | undefined): File[] {
  if (!file) return [];
  return Array.isArray(file) ? file : [file];
}

function normalizeField(field: string | string[] | undefined): string {
  if (!field) return "";
  return Array.isArray(field) ? field[0] : field;
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

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) throw new Error("No PDF file uploaded");
    const file = pdfFiles[0];
    if (!file.mimetype?.includes("pdf")) throw new Error("File must be a PDF");
    const pdfBytes = await readFile(file.filepath);
    const watermark = normalizeField(fields.watermark);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermark, {
        x: width / 2 - watermark.length * 3,
        y: height / 2,
        size: 36,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.3,
        rotate: { angle: -0.5 },
      });
    });
    const watermarkedBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(watermarkedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=watermarked.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 