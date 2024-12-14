import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to allow formidable to handle it
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse the form using formidable
    const form = new formidable.IncomingForm({ keepExtensions: true });

    const { files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
          if (err) {
            console.error('Error parsing form:', err); // Log parsing errors
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      }
    );

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      console.error('No file uploaded'); // Log missing file error
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const filePath = file.filepath;
    const fileType = file.mimetype;

    console.log('File uploaded:', { filePath, fileType }); // Log uploaded file details

    let content = '';

    if (fileType === 'application/pdf') {
      const data = await pdf(fs.readFileSync(filePath));
      content = data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = fs.readFileSync(filePath);
      const { value: text } = await mammoth.extractRawText({ buffer: arrayBuffer });
      content = text;
    } else {
      console.error('Unsupported file type:', fileType); // Log unsupported file types
      throw new Error('Unsupported file type');
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error processing file:', error); // Log server error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

