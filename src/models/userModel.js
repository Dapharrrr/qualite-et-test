import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createUser = async (email, password, isAdmin = false) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    const res = await client.query(
      'INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id, email, is_admin, created_at',
      [email, hashedPassword, isAdmin]
    );
    const user = res.rows[0];
    if (user) {
      user.role = user.is_admin ? 'admin' : 'user';
    }
    return user;
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];
    if (user) {
      user.role = user.is_admin ? 'admin' : 'user';
    }
    return user;
  } finally {
    client.release();
  }
};

export const findUserById = async (id) => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, email, is_admin FROM users WHERE id = $1', [id]);
    const user = res.rows[0];
    if (user) {
      user.role = user.is_admin ? 'admin' : 'user';
    }
    return user;
  } finally {
    client.release();
  }
};

export const deleteUser = async (id) => {
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount > 0;
  } finally {
    client.release();
  }
};

export const updateUser = async (id, updates) => {
  const client = await pool.connect();
  try {
    if (updates.email) {
      const res = await client.query(
        'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, is_admin',
        [updates.email, id]
      );
      return res.rows[0];
    }
    return null;
  } finally {
    client.release();
  }
};

export const loginUser = async (email, password) => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  } finally {
    client.release();
  }
};
