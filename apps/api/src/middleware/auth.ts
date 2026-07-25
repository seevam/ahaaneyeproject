import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { env } from '../config/env';

export interface AuthPayload {
  userId: string;
  role: string;
}

interface JwtPayload {
  sub: string; // our internal user UUID
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token', statusCode: 401 });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not found', statusCode: 401 });
      return;
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions', statusCode: 403 });
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    db.query.users.findFirst({ where: eq(users.id, payload.sub) })
      .then((user) => {
        if (user) req.user = { userId: user.id, role: user.role };
      })
      .catch(() => {})
      .finally(() => next());
  } catch {
    next();
  }
}
