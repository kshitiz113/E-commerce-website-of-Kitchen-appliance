//delete the user by id

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
};

export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = params;
    connection = await mysql.createConnection(dbConfig);
    
    // First check if user exists
    const [user] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}