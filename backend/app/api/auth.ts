import { Router, Request, Response } from 'express';
import { authService, userService } from '../services';
import { validateLogin } from '../schemas';
import { authenticateToken } from '../middleware/auth';
import { hashPassword, generateToken } from '../utils/crypto';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { full_name, email, password, role } = req.body;
  if (!full_name || !email || !password) {
    res.status(400).json({ error: 'Full name, email, and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }
  
  if (role && role !== 'Employee') {
    res.status(400).json({ error: 'Access forbidden: Only Employee role accounts can sign up through this page.' });
    return;
  }
  
  try {
    const hashedPasswordStr = hashPassword(password);
    const userRole = 'Employee';
    const safeUser = await userService.createUser({
      full_name,
      email,
      password_hash: hashedPasswordStr,
      role: userRole
    });
    
    // Auto login
    const token = generateToken({ id: safeUser.id, role: safeUser.role });
    res.status(201).json({ token, user: safeUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const validationError = validateLogin(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid email or password' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err: any) {
    // If credentials are stale/invalid during refresh, get current safe profile
    try {
      const user = await authService.getMe(req.user.id);
      res.json({ user });
    } catch {
      res.status(401).json({ error: 'Session expired' });
    }
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
