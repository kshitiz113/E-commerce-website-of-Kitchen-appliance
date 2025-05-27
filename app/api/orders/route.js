import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(request) {
  let connection;
  try {
    // 1. Get and verify the user session from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 2. Process order data
    const data = await request.json();
    connection = await mysql.createConnection(dbConfig);
    
    await connection.beginTransaction();

    // 3. Create order with the authenticated user's ID
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
      (user_id, total_amount, payment_method, transaction_id, delivery_address) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        userId, // Use the authenticated user's ID
        data.amount,
        data.paymentMethod,
        data.transactionId,
        data.deliveryAddress
      ]
    );

    const orderId = orderResult.insertId;

    // 4. Add order item
    await connection.execute(
      `INSERT INTO order_items 
      (order_id, appliance_id, quantity, unit_price) 
      VALUES (?, ?, ?, ?)`,
      [
        orderId,
        data.productId,
        data.quantity,
        data.amount / data.quantity
      ]
    );

    // 5. Update stock quantity
    await connection.execute(
      `UPDATE appliance_details 
      SET stock_quantity = stock_quantity - ? 
      WHERE appliance_id = ?`,
      [data.quantity, data.productId]
    );

    await connection.commit();

    return NextResponse.json(
      { orderId, message: 'Order created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (connection) await connection.rollback();
    
    console.error('Order creation failed:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid session. Please login again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.end();
  }
}