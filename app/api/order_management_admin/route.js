import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
};

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.appliance_id,
        oi.quantity,
        oi.unit_price,
        a.name as appliance_name,
        a.type as appliance_type,
        a.photo_path,
        u.email as user_email,
        u.id as user_id,
        o.order_date as created_at,
        o.transaction_id,
        o.payment_status,
        o.payment_method,
        o.delivery_address,
        o.total_amount
      FROM order_items oi
      JOIN appliance a ON oi.appliance_id = a.id
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
    `);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        error: 'Database error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}