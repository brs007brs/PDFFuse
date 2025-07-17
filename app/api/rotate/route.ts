import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
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

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) throw new Error("No PDF file uploaded");
    const file = pdfFiles[0];
    if (!file.mimetype?.includes("pdf")) throw new Error("File must be a PDF");
    const pdfBytes = await readFile(file.filepath);
    const angleField = fields.angle;
    const angle = Array.isArray(angleField) ? parseInt(angleField[0], 10) : parseInt(angleField as string, 10) || 0;

    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.getPages().forEach(page => page.setRotation(degrees(angle)));
    const rotatedBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(rotatedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=rotated.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 