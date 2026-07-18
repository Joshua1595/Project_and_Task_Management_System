import { Router, Request, Response } from 'express';
import { userService } from '../services';
import { validateCreateUser } from '../schemas';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { hashPassword } from '../utils/crypto';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = userService.getUserById(req.params.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Add user (Admin only)
router.post('/', authenticateToken, requireRoles(['Administrator']), (req: Request, res: Response) => {
  const validationError = validateCreateUser(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  
  try {
    const { full_name, email, password, role } = req.body;
    if (role === 'Administrator') {
      res.status(400).json({ error: 'Access forbidden: Administrators cannot be created through the API. They must be registered directly in the database.' });
      return;
    }
    const newUser = userService.createUser({
      full_name,
      email,
      password_hash: hashPassword(password),
      role
    });
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Edit user profile (Admin can edit any user; any user can edit their own basic info / password)
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Authorization check
  if (req.user!.role !== 'Administrator' && req.user!.id !== id) {
    res.status(403).json({ error: 'Access forbidden: You cannot update other users profile' });
    return;
  }
  
  try {
    const updates: any = {};
    const { full_name, email, password, role, is_active, profile_image } = req.body;
    
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email;
    if (profile_image) updates.profile_image = profile_image;
    if (password) updates.password_hash = hashPassword(password);
    
    // Only Administrators can modify roles or active status
    if (req.user!.role === 'Administrator') {
      if (role) {
        if (role === 'Administrator') {
          const targetUser = userService.getUserById(id);
          if (targetUser.role !== 'Administrator') {
            res.status(400).json({ error: 'Access forbidden: Promotion to Administrator is disabled. Administrators must be created directly in the database.' });
            return;
          }
        }
        updates.role = role;
      }
      if (is_active !== undefined) updates.is_active = is_active;
    }
    
    const updatedUser = userService.updateUser(id, updates);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRoles(['Administrator']), (req: Request, res: Response) => {
  try {
    const result = userService.deleteUser(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
