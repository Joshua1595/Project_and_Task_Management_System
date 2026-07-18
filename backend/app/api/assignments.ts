import { Router, Request, Response } from 'express';
import { assignmentService } from '../services';
import { validateCreateAssignment } from '../schemas';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateTaskExists, validateUserExists } from '../dependencies';

const router = Router();

// Get assignments
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const assignments = assignmentService.getAssignments();
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Assignments for a task (PM/Admin only)
router.post('/', authenticateToken, requireRoles(['Administrator', 'Project Manager']), validateTaskExists, validateUserExists, (req: Request, res: Response) => {
  const validationError = validateCreateAssignment(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  
  try {
    const { task_id, user_id } = req.body;
    const newAssignment = assignmentService.assignTask(task_id, user_id);
    res.status(201).json(newAssignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get task assignments for a specific user
router.get('/user/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const userAssignments = assignmentService.getAssignmentsByUserId(req.params.id);
    res.json(userAssignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
