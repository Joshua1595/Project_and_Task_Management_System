import { Router, Request, Response } from 'express';
import { taskService } from '../services';
import { validateCreateTask } from '../schemas';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateProjectExists } from '../dependencies';

const router = Router();

// GET Tasks list (with filtering)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const projectId = req.query.project_id as string | undefined;
    const tasks = taskService.getTasksForUser(projectId, req.user!.id, req.user!.role);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const task = taskService.getTaskById(req.params.id, req.user!.id, req.user!.role);
    res.json(task);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Create task (PM and Admin only)
router.post('/', authenticateToken, requireRoles(['Administrator', 'Project Manager']), validateProjectExists, (req: Request, res: Response) => {
  const validationError = validateCreateTask(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  
  try {
    const { project_id, title, description, priority, deadline } = req.body;
    const newTask = taskService.createTask(
      project_id,
      title,
      description,
      priority,
      deadline
    );
    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Task (PM/Admin can update everything; Employees can update task status only)
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const updatedTask = taskService.updateTask(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.json(updatedTask);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Delete Task (PM and Admin only)
router.delete('/:id', authenticateToken, requireRoles(['Administrator', 'Project Manager']), (req: Request, res: Response) => {
  try {
    const result = taskService.deleteTask(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
