import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(
      'SELECT * FROM appliance_images WHERE appliance_id = ?',
      [id]
    );

    await connection.end();

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}