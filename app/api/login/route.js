import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      'SELECT id, email, password FROM users WHERE email = ?', 
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = rows[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      //  role: user.role,
        isAdmin: user.email === 'admin@gmail.com'
      },
      process.env.JWT_SECRET, // Make sure to set this in your environment variables
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Set HTTP-only cookie
    cookies().set({
      name: 'sessionToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 // 1 hour in seconds
    });

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
     // role: user.role,
      isAdmin: user.email === 'admin@gmail.com'
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}