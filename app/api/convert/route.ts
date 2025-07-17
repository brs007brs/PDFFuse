import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { readFile } from "fs/promises";

export const config = { api: { bodyParser: false } };

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
    const file = files.file;
    if (!file) throw new Error("No file uploaded");
    const conversion = (fields.conversion as string) || "";

    // Only allow PDF-to-PDF features on Vercel
    return NextResponse.json({
      error:
        "PDF-to-JPG and JPG-to-PDF conversion is not supported on Vercel. Please use PDF-to-PDF tools (merge, split, compress, rotate, watermark, page numbers)."
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 