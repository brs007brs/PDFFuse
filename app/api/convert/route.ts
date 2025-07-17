import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { readFile } from "fs/promises";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { createCanvas } from "canvas";
import JSZip from "jszip";
import sharp from "sharp";

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

async function pdfToJpg(pdfBuffer: Buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;
    const buffer = canvas.toBuffer("image/jpeg");
    zip.file(`page${i}.jpg`, buffer);
  }
  return await zip.generateAsync({ type: "nodebuffer" });
}

async function jpgToPdf(imageBuffer: Buffer) {
  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedJpg(imageBuffer);
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  return await pdfDoc.save();
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const file = files.file;
    if (!file) throw new Error("No file uploaded");
    const fileBuffer = await readFile(file.filepath);
    const conversion = (fields.conversion as string) || "";

    if (conversion === "pdf-to-jpg") {
      const zipBuffer = await pdfToJpg(fileBuffer);
      return new NextResponse(Buffer.from(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": "attachment; filename=images.zip",
        },
      });
    } else if (conversion === "jpg-to-pdf") {
      // Convert to JPEG if not already
      const jpegBuffer = await sharp(fileBuffer).jpeg().toBuffer();
      const pdfBuffer = await jpgToPdf(jpegBuffer);
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=converted.pdf",
        },
      });
    } else {
      return NextResponse.json({ error: "Unsupported conversion type" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 