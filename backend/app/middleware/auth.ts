import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { verifyToken } from '../utils/crypto';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Access token invalid or expired' });
    return;
  }
  
  req.user = decoded;
  next();
}

export function requireRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
}
