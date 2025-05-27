import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Get token from cookies
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Delete item using your existing db connection
    await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [id, userId]
    );

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
    console.error('DELETE cart item error:', error);
    return NextResponse.json(
      { message: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Get token from cookies
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { quantity } = await request.json();

    // Update quantity using your existing db connection
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );

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
    console.error('PUT cart item error:', error);
    return NextResponse.json(
      { message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}