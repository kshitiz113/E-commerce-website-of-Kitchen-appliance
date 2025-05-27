import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
};

// Hash password with bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT id, email FROM users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(request) {
  let connection;
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    return NextResponse.json(
      { id: result.insertId, email },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

export async function DELETE(request) {
  let connection;
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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