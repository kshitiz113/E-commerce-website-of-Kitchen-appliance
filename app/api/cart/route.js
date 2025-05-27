import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch cart items using your existing db connection
    const [cartItems] = await db.query(
      `SELECT ci.*, a.name, a.price, a.photo_path 
       FROM cart_items ci
       JOIN appliance a ON ci.appliance_id = a.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('GET cart error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { applianceId, quantity = 1 } = await request.json();

    // Check if item exists using your existing db connection
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND appliance_id = ?',
      [userId, applianceId]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND appliance_id = ?',
        [quantity, userId, applianceId]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart_items (user_id, appliance_id, quantity) VALUES (?, ?, ?)',
        [userId, applianceId, quantity]
      );
    }

    // Return updated cart
    const [updatedCart] = await db.query(
      `SELECT ci.*, a.name, a.price, a.photo_path 
       FROM cart_items ci
       JOIN appliance a ON ci.appliance_id = a.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('POST cart error:', error);
    return NextResponse.json(
      { message: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}