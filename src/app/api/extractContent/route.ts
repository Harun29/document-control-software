import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log('Processing /api/extractContent...');
    
    // Initialize formidable with proper typings
    const form = formidable({ multiples: false });

    // Helper function to parse the request
    const parseForm = async (
      req: Parameters<typeof form.parse>[0]
    ): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
    };

    const { files } = await parseForm(req as any);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(file.filepath);
    let content = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(fileBuffer);
      content = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
      content = value;
    } else {
      return NextResponse.json(
        { message: 'Unsupported file type' },
        { status: 415 }
      );
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500 }
    );
  }
}
