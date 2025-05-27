import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password)
    return Response.json({ message: 'Missing fields' }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [rows] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [
      email,
      hashedPassword,
    ]);
    return Response.json({ message: 'User registered successfully' });
  } catch (err) {
    return Response.json({ message: 'User already exists or DB error' }, { status: 500 });
  }
}
