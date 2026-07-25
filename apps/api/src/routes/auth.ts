import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/**
 * POST /auth/register
 * Body: { name: string, phone: string }
 * Creates a new user (or returns the existing one for the phone number)
 * and returns a JWT.
 */
router.post('/register', async (req: Request, res: Response) => {
  const { name, phone } = req.body as { name?: string; phone?: string };

  if (!name?.trim()) {
    res.status(400).json({ error: 'Bad Request', message: 'Name is required', statusCode: 400 });
    return;
  }
  if (!phone?.trim()) {
    res.status(400).json({ error: 'Bad Request', message: 'Phone number is required', statusCode: 400 });
    return;
  }

  try {
    // If a user with this phone already exists, return their token (idempotent)
    const existing = await db.query.users.findFirst({
      where: eq(users.phone, phone.trim()),
    });

    if (existing) {
      const token = signToken(existing.id);
      res.json({ data: { token, user: existing } });
      return;
    }

    const [user] = await db
      .insert(users)
      .values({ name: name.trim(), phone: phone.trim() })
      .returning();

    const token = signToken(user.id);
    res.status(201).json({ data: { token, user } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Registration failed', statusCode: 500 });
  }
});

/**
 * POST /auth/login
 * Body: { phone: string }
 * Returns a JWT for the user with that phone number, or 404 if not found.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { phone } = req.body as { phone?: string };

  if (!phone?.trim()) {
    res.status(400).json({ error: 'Bad Request', message: 'Phone number is required', statusCode: 400 });
    return;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone.trim()),
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'No account found for this phone number', statusCode: 404 });
      return;
    }

    const token = signToken(user.id);
    res.json({ data: { token, user } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Login failed', statusCode: 500 });
  }
});

/**
 * GET /auth/me
 * Returns the current user's profile.
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found', statusCode: 404 });
      return;
    }

    res.json({ data: user });
  } catch {
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch user', statusCode: 500 });
  }
});

export default router;
