import { UserRole, ProjectStatus, TaskPriority, TaskStatus } from '../models';

export interface LoginInput {
  email?: string;
  password?: string;
}

export interface CreateUserInput {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
  profile_image?: string;
}

export interface CreateProjectInput {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface CreateTaskInput {
  project_id?: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
}

export interface CreateAssignmentInput {
  task_id?: string;
  user_id?: string;
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateLogin(input: LoginInput): string | null {
  if (!input.email || !input.password) {
    return 'Email and password are required';
  }
  if (!validateEmail(input.email)) {
    return 'Invalid email format';
  }
  return null;
}

export function validateCreateUser(input: CreateUserInput): string | null {
  if (!input.full_name || !input.email || !input.password || !input.role) {
    return 'full_name, email, password, and role are required';
  }
  if (!validateEmail(input.email)) {
    return 'Invalid email format';
  }
  if (input.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  const validRoles: UserRole[] = ['Administrator', 'Project Manager', 'Employee'];
  if (!validRoles.includes(input.role)) {
    return 'Invalid user role specified';
  }
  return null;
}

export function validateCreateProject(input: CreateProjectInput): string | null {
  if (!input.title || !input.description || !input.start_date || !input.end_date) {
    return 'title, description, start_date, and end_date are required';
  }
  if (isNaN(Date.parse(input.start_date)) || isNaN(Date.parse(input.end_date))) {
    return 'Invalid date format';
  }
  return null;
}

export function validateCreateTask(input: CreateTaskInput): string | null {
  if (!input.project_id || !input.title || !input.description || !input.priority || !input.deadline) {
    return 'project_id, title, description, priority, and deadline are required';
  }
  const validPriorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(input.priority)) {
    return 'Invalid task priority specified';
  }
  if (isNaN(Date.parse(input.deadline))) {
    return 'Invalid deadline date format';
  }
  return null;
}

export function validateCreateAssignment(input: CreateAssignmentInput): string | null {
  if (!input.task_id || !input.user_id) {
    return 'task_id and user_id are required';
  }
  return null;
}
