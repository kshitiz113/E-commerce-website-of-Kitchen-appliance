import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('sessionToken')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const connection = await mysql.createConnection(dbConfig);

    // Get user orders with order items and appliance details
    const [orders] = await connection.execute(`
      SELECT 
        o.id AS order_id,
        o.order_date,
        o.total_amount,
        o.payment_status,
        o.payment_method,
        o.transaction_id,
        o.delivery_address,
        oi.id AS item_id,
        oi.quantity,
        oi.unit_price,
        a.id AS appliance_id,
        a.name AS appliance_name,
        a.type AS appliance_type,
        a.photo_path AS appliance_image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN appliance a ON oi.appliance_id = a.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId]);

    await connection.end();

    if (orders.length === 0) {
      return NextResponse.json(
        { message: 'No orders found' },
        { status: 404 }
      );
    }

    // Group items by order
    const groupedOrders = orders.reduce((acc, item) => {
      const orderIndex = acc.findIndex(o => o.order_id === item.order_id);
      
      if (orderIndex === -1) {
        acc.push({
          order_id: item.order_id,
          order_date: item.order_date,
          total_amount: item.total_amount,
          payment_status: item.payment_status,
          payment_method: item.payment_method,
          transaction_id: item.transaction_id,
          delivery_address: item.delivery_address,
          items: [{
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            appliance_id: item.appliance_id,
            appliance_name: item.appliance_name,
            appliance_type: item.appliance_type,
            appliance_image: item.appliance_image
          }]
        });
      } else {
        acc[orderIndex].items.push({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          appliance_id: item.appliance_id,
          appliance_name: item.appliance_name,
          appliance_type: item.appliance_type,
          appliance_image: item.appliance_image
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json({ orders: groupedOrders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid session. Please login again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}