import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export const config = { api: { bodyParser: false } };

async function parseForm(req: NextRequest): Promise<{ files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);
    const jpgFiles = Array.isArray(files.files) ? files.files : [files.files];
    if (!jpgFiles || jpgFiles.length === 0 || !jpgFiles[0]) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of jpgFiles) {
      const imgBuffer = fs.readFileSync(file.filepath);
      const image = await sharp(imgBuffer).jpeg().toBuffer();
      const pdfImage = await pdfDoc.embedJpg(image);
      const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
      page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 