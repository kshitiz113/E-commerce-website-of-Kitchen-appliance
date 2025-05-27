import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool instead of individual connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET /api/appliance/[id]
export async function GET(request, { params }) {
  const { id } = params;

  // Validate ID
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM appliance WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
}

// DELETE /api/appliance/[id]
export async function DELETE(request, { params }) {
  const { id } = params;

  // Validate ID
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    // First check if product exists
    const [checkResult] = await connection.execute(
      'SELECT id FROM appliance WHERE id = ?',
      [id]
    );

    if (checkResult.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product
    await connection.execute(
      'DELETE FROM appliance WHERE id = ?',
      [id]
    );

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}