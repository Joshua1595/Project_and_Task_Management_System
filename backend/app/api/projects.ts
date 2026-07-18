import { Router, Request, Response } from 'express';
import { projectService } from '../services';
import { validateCreateProject } from '../schemas';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// GET Projects list (with role-based filters)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const projects = projectService.getProjectsForUser(req.user!.id, req.user!.role);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const project = projectService.getProjectById(req.params.id, req.user!.id, req.user!.role);
    res.json(project);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Create project (Project Manager and Admin only)
router.post('/', authenticateToken, requireRoles(['Administrator', 'Project Manager']), (req: Request, res: Response) => {
  const validationError = validateCreateProject(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  
  try {
    const { title, description, start_date, end_date } = req.body;
    const newProject = projectService.createProject(
      title,
      description,
      start_date,
      end_date,
      req.user!.id
    );
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Project (PM and Admin only)
router.put('/:id', authenticateToken, requireRoles(['Administrator', 'Project Manager']), (req: Request, res: Response) => {
  try {
    const updatedProject = projectService.updateProject(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.json(updatedProject);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Delete Project (PM and Admin only)
router.delete('/:id', authenticateToken, requireRoles(['Administrator', 'Project Manager']), (req: Request, res: Response) => {
  try {
    const result = projectService.deleteProject(req.params.id, req.user!.id, req.user!.role);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

export default router;
