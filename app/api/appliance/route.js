//api/appliance-details/route.js
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(`
      SELECT a.*, ad.description, ad.specifications, ad.wattage, 
             ad.dimensions, ad.weight, ad.warranty_months, ad.stock_quantity
      FROM appliance a
      LEFT JOIN appliance_details ad ON a.id = ad.appliance_id
    `);

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Error fetching data', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request) {
  let connection;
  try {
    // Check if the request is multipart/form-data for file upload
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('multipart/form-data')) {
      return handleFileUpload(request);
    }

    // Handle JSON data
    const data = await request.json();
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Insert into appliance table
    const [applianceResult] = await connection.execute(
      'INSERT INTO appliance (name, type, price, photo_path) VALUES (?, ?, ?, ?)',
      [data.name, data.type, data.price, data.photo_path || null]
    );

    const applianceId = applianceResult.insertId;

    // Insert into appliance_details if details exist
    if (data.description || data.specifications) {
      await connection.execute(
        `INSERT INTO appliance_details 
        (appliance_id, description, specifications, wattage, dimensions, weight, warranty_months, stock_quantity) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applianceId,
          data.description || null,
          data.specifications || null,
          data.wattage || null,
          data.dimensions || null,
          data.weight || null,
          data.warranty_months || null,
          data.stock_quantity || null
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      { id: applianceId, message: 'Product added successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Failed to add product', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

async function handleFileUpload(request) {
  let connection;
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const applianceId = formData.get('appliance_id');
    const caption = formData.get('caption') || '';

    if (!image) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'appliances');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = image.name.split('.').pop();
    const filename = `appliance_${timestamp}.${ext}`;
    const filePath = join(uploadDir, filename);
    const publicPath = `/uploads/appliances/${filename}`;

    // Convert image to buffer and save
    const buffer = Buffer.from(await image.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save to database
    connection = await pool.getConnection();
    
    if (applianceId) {
      // Additional image for existing appliance
      await connection.execute(
        'INSERT INTO appliance_images (appliance_id, image_path, caption) VALUES (?, ?, ?)',
        [applianceId, publicPath, caption]
      );
    } else {
      // Main image for new appliance
      const [result] = await connection.execute(
        'INSERT INTO appliance (photo_path) VALUES (?)',
        [publicPath]
      );
      return NextResponse.json(
        { id: result.insertId, imagePath: publicPath },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { imagePath: publicPath, message: 'Image uploaded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload image', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}



