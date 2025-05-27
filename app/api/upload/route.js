import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `appliance_${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/appliances');
    const filePath = path.join(uploadDir, filename);
    const publicPath = `/uploads/appliances/${filename}`;

    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Error saving file:', err);
      return NextResponse.json(
        { error: 'Failed to save image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ path: publicPath }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload error: ' + error.message },
      { status: 500 }
    );
  }
}