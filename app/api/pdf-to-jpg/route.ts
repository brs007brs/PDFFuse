import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
// @ts-ignore
import { fromPath } from 'pdf2pic';

export const config = { api: { bodyParser: false } };

async function parseForm(req: NextRequest): Promise<{ files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const pdfPath = file.filepath;

    // Convert first page of PDF to JPG using pdf2pic
    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: 'untitled',
      savePath: '/tmp',
      format: 'jpg',
      width: 1200,
      height: 1600,
    });

    const result = await converter(1, true); // Convert first page
    const jpgBuffer = fs.readFileSync(result.path);

    return new NextResponse(jpgBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="page-1.jpg"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 