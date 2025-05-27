// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});

    const token = cookies.sessionToken;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return NextResponse.json({ 
      user: {
        id: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}