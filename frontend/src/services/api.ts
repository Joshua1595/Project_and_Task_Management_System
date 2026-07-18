import { 
  User, Project, Task, TaskAssignment, 
  DashboardStats, AuthResponse 
} from '../types';

const API_BASE = (import.meta as any).env.VITE_API_BASE || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('smart_task_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export const api = {
  // Authentication
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(data: { full_name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<Omit<User, 'password_hash'>> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Omit<User, 'password_hash'>>(res);
  },

  // Users CRUD
  async getUsers(): Promise<Omit<User, 'password_hash'>[]> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Omit<User, 'password_hash'>[]>(res);
  },

  async getUser(id: string): Promise<Omit<User, 'password_hash'>> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Omit<User, 'password_hash'>>(res);
  },

  async createUser(data: any): Promise<Omit<User, 'password_hash'>> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Omit<User, 'password_hash'>>(res);
  },

  async updateUser(id: string, data: any): Promise<Omit<User, 'password_hash'>> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Omit<User, 'password_hash'>>(res);
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Projects CRUD
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Project>(res);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Tasks CRUD
  async getTasks(projectId?: string): Promise<Task[]> {
    const url = projectId ? `${API_BASE}/tasks?project_id=${projectId}` : `${API_BASE}/tasks`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Task[]>(res);
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Task>(res);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Assignments
  async getAssignments(): Promise<TaskAssignment[]> {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<TaskAssignment[]>(res);
  },

  async assignTask(taskId: string, userId: string): Promise<TaskAssignment> {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ task_id: taskId, user_id: userId }),
    });
    return handleResponse<TaskAssignment>(res);
  },

  async getUserAssignments(userId: string): Promise<TaskAssignment[]> {
    const res = await fetch(`${API_BASE}/assignments/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<TaskAssignment[]>(res);
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  }
};
