//api/appliance-details/route.js
import { NextResponse } from 'next/server';

import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST|| 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
};

export async function POST(request) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const data = await request.json();

    await connection.execute(
      'INSERT INTO appliance_details (appliance_id, description, specifications, wattage, dimensions, weight, warranty_months, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.appliance_id,
        data.description,
        data.specifications,
        data.wattage,
        data.dimensions,
        data.weight,
        data.warranty_months,
        data.stock_quantity,
      ]
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