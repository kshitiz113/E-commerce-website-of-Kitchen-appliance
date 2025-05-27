import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { writeFile } from 'fs/promises';
import path from 'path';

const dbConfig = {
  host: process.env.DB_HOST||"localhost",
  user: process.env.DB_USER ||  "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "intern",
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const applianceId = formData.get('appliance_id');

    if (!image || !applianceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO appliance_images (appliance_id, image_path) VALUES (?, ?)',
      [applianceId, publicPath]
    );

    await connection.end();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}