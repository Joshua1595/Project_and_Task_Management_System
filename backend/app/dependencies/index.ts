import { Request, Response, NextFunction } from 'express';
import { projectRepository, taskRepository, userRepository } from '../repositories';

export function validateProjectExists(req: Request, res: Response, next: NextFunction) {
  const projectId = req.body.project_id || req.params.project_id || req.query.project_id;
  if (projectId) {
    const project = projectRepository.getById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Referenced project does not exist' });
      return;
    }
  }
  next();
}

export function validateTaskExists(req: Request, res: Response, next: NextFunction) {
  const taskId = req.body.task_id || req.params.task_id || req.query.task_id;
  if (taskId) {
    const task = taskRepository.getById(taskId);
    if (!task) {
      res.status(404).json({ error: 'Referenced task does not exist' });
      return;
    }
  }
  next();
}

export function validateUserExists(req: Request, res: Response, next: NextFunction) {
  const userId = req.body.user_id || req.params.user_id || req.query.user_id;
  if (userId) {
    const user = userRepository.getById(userId);
    if (!user) {
      res.status(404).json({ error: 'Referenced user does not exist' });
      return;
    }
  }
  next();
}
