import { createPool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Create a connection pool
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'intern',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(req) {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing in environment variables!");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    // Get cookies synchronously
    const cookieStore = cookies();
    const token = cookieStore.get("sessionToken")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("🔹 Decoded token:", decoded);
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token. Please log in again." }),
        { status: 403 }
      );
    }

    const userEmail = decoded.email;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "Token payload invalid" }),
        { status: 400 }
      );
    }

    // Input validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: "New passwords do not match" }),
        { status: 400 }
      );
    }

    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Fetch user from DB
      const [users] = await connection.query("SELECT * FROM users WHERE email = ?", [userEmail]);
      if (users.length === 0) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404 }
        );
      }

      const user = users[0];

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return new Response(
          JSON.stringify({ error: "Current password is incorrect" }),
          { status: 400 }
        );
      }

      // Hash new password and update DB
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, userEmail]);

      return new Response(
        JSON.stringify({ message: "Password updated successfully" }),
        { status: 200 }
      );
    } finally {
      // Release the connection back to the pool
      connection.release();
    }

  } catch (error) {
    console.error("❌ Error updating password:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}