import { User, UserRole } from './user';
import { Project, ProjectStatus } from './project';
import { Task, TaskPriority, TaskStatus } from './task';
import { TaskAssignment } from './assignment';

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  assignments: TaskAssignment[];
}

export type { 
  User, Project, Task, TaskAssignment, 
  UserRole, ProjectStatus, TaskPriority, TaskStatus 
};

