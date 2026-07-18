export type UserRole = 'Administrator' | 'Project Manager' | 'Employee';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
