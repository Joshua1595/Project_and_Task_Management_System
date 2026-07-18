export type ProjectStatus = 'Active' | 'Archived' | 'Completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  manager_id: string; // User ID of the Project Manager
  created_at: string;
  updated_at: string;
}
