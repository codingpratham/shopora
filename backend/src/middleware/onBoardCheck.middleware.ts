import type { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';

/**
 * Middleware to ensure the authenticated user has completed the onboarding process.
 * Assumes the `authenticate` middleware has already populated `req.userId`.
 */
export const onBoardCheck = async (req: Request, res: Response, next: NextFunction) => {
  // Ensure userId is present (should be set by authenticate).
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check onboarding flag.
    if (!user.onBoard) {
      return res
        .status(403)
        .json({ message: 'Onboarding incomplete. Access denied.' });
    }

    // User is onboarded, continue.
    next();
  } catch (error: any) {
    console.error('OnBoardCheck error:', error);
    return res
      .status(500)
      .json({ message: error?.message || 'Internal server error' });
  }
};
