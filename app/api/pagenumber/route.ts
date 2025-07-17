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

function getPositionCoords(position: string, width: number, height: number) {
  switch (position) {
    case "top-left": return { x: 20, y: height - 40 };
    case "top-right": return { x: width - 60, y: height - 40 };
    case "bottom-left": return { x: 20, y: 20 };
    case "bottom-right": return { x: width - 60, y: 20 };
    default: return { x: width - 60, y: 20 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const pdfFiles = normalizeFiles(files.file);
    if (!pdfFiles.length) throw new Error("No PDF file uploaded");
    const file = pdfFiles[0];
    if (!file.mimetype?.includes("pdf")) throw new Error("File must be a PDF");
    const pdfBytes = await readFile(file.filepath);
    const position = normalizeField(fields.position) || "bottom-right";

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const { x, y } = getPositionCoords(position, width, height);
      page.drawText(String(idx + 1), {
        x,
        y,
        size: 18,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
    const numberedBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(numberedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=numbered.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 