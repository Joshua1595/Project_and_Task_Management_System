export type UserRole = 'Administrator' | 'Project Manager' | 'Employee';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'Active' | 'Archived' | 'Completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  administrator?: {
    totalUsers: number;
    totalProjects: number;
    completedTasks: number;
    pendingTasks: number;
  };
  projectManager?: {
    activeProjects: number;
    teamProgress: number;
    upcomingDeadlines: Array<{
      taskId: string;
      taskTitle: string;
      projectTitle: string;
      deadline: string;
      priority: TaskPriority;
    }>;
  };
  employee?: {
    assignedTasksCount: number;
    completedTasksCount: number;
    dueSoonCount: number;
  };
}
