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
    const { transactionId } = params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [orders] = await connection.execute(
      `SELECT o.*, 
      GROUP_CONCAT(oi.appliance_id) AS product_ids,
      GROUP_CONCAT(oi.quantity) AS quantities
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.transaction_id = ?
      GROUP BY o.id`,
      [transactionId]
    );

    await connection.end();

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(orders[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order: ' + error.message },
      { status: 500 }
    );
  }
}