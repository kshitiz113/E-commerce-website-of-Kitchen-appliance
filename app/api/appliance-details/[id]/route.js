import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
database: process.env.DB_NAME || 'intern',
};

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(
      'SELECT * FROM appliance_details WHERE appliance_id = ?',
      [id]
    );

    await connection.end();

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Product details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}