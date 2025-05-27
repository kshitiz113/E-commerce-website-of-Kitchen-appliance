import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER    || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
};

export async function PATCH(request, { params }) {
  const { id } = params;
  let connection;

  try {
    const { operation, quantity } = await request.json();
    
    if (!['add', 'remove'].includes(operation)) {
      throw new Error('Invalid operation');
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Get current stock
    const [current] = await connection.execute(
      'SELECT stock_quantity FROM appliance_details WHERE appliance_id = ?',
      [id]
    );

    if (current.length === 0) {
      return NextResponse.json(
        { error: 'Product details not found' },
        { status: 404 }
      );
    }

    const currentStock = current[0].stock_quantity;
    let newStock;

    if (operation === 'add') {
      newStock = currentStock + quantity;
    } else {
      newStock = Math.max(0, currentStock - quantity);
    }

    // Update stock
    await connection.execute(
      'UPDATE appliance_details SET stock_quantity = ? WHERE appliance_id = ?',
      [newStock, id]
    );

    return NextResponse.json(
      { success: true, newStock },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update stock' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.end();
  }
}