import { 
  userRepository, 
  projectRepository, 
  taskRepository, 
  assignmentRepository 
} from '../repositories';
import { User, Project, Task, TaskAssignment, UserRole, ProjectStatus, TaskPriority, TaskStatus } from '../models';
import { hashPassword, generateToken } from '../utils/crypto';

export const authService = {
  async login(email: string, password: string) {
    const user = userRepository.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (user.password_hash !== hashPassword(password)) {
      throw new Error('Invalid email or password');
    }
    if (!user.is_active) {
      throw new Error('This user account is inactive');
    }
    const token = generateToken({ id: user.id, role: user.role });
    const { password_hash, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async getMe(userId: string) {
    const user = userRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
};

export const userService = {
  getAllUsers() {
    const users = userRepository.getAll();
    return users.map(({ password_hash, ...safeUser }) => safeUser);
  },

  getUserById(id: string) {
    const user = userRepository.getById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  createUser(data: { full_name: string; email: string; password_hash: string; role: UserRole }) {
    const existing = userRepository.getByEmail(data.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      role: data.role,
      profile_image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const created = userRepository.create(newUser);
    const { password_hash, ...safeUser } = created;
    return safeUser;
  },

  updateUser(id: string, updates: Partial<User>) {
    const user = userRepository.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.email) {
      const existing = userRepository.getByEmail(updates.email);
      if (existing && existing.id !== id) {
        throw new Error('Email is already taken by another user');
      }
    }

    const updated = userRepository.update(id, updates);
    if (!updated) {
      throw new Error('Failed to update user');
    }

    const { password_hash, ...safeUser } = updated;
    return safeUser;
  },

  deleteUser(id: string) {
    const deleted = userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return { success: true, message: 'User deleted successfully' };
  }
};

export const projectService = {
  getProjectsForUser(userId: string, role: UserRole) {
    const allProjects = projectRepository.getAll();
    if (role === 'Employee') {
      const employeeAssignments = assignmentRepository.getByUserId(userId);
      const employeeTaskIds = employeeAssignments.map(a => a.task_id);
      
      const allTasks = taskRepository.getAll();
      const employeeProjectIds = allTasks
        .filter(t => employeeTaskIds.includes(t.id))
        .map(t => t.project_id);

      return allProjects.filter(p => employeeProjectIds.includes(p.id));
    }
    return allProjects;
  },

  getProjectById(id: string, userId: string, role: UserRole) {
    const project = projectRepository.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    if (role === 'Employee') {
      const employeeAssignments = assignmentRepository.getByUserId(userId);
      const employeeTaskIds = employeeAssignments.map(a => a.task_id);
      
      const allTasks = taskRepository.getAll();
      const isAssigned = allTasks.some(t => t.project_id === id && employeeTaskIds.includes(t.id));
      if (!isAssigned) {
        throw new Error('Access forbidden: You are not assigned to this project');
      }
    }

    return project;
  },

  createProject(title: string, description: string, startDate: string, endDate: string, managerId: string) {
    const newProject: Project = {
      id: 'proj_' + Date.now(),
      title,
      description,
      status: 'Active',
      start_date: startDate,
      end_date: endDate,
      manager_id: managerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return projectRepository.create(newProject);
  },

  updateProject(id: string, updates: Partial<Project>, userId: string, role: UserRole) {
    const project = projectRepository.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    if (role !== 'Administrator' && project.manager_id !== userId) {
      throw new Error('Access forbidden: You do not manage this project');
    }

    const updated = projectRepository.update(id, updates);
    if (!updated) {
      throw new Error('Failed to update project');
    }
    return updated;
  },

  deleteProject(id: string, userId: string, role: UserRole) {
    const project = projectRepository.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    if (role !== 'Administrator' && project.manager_id !== userId) {
      throw new Error('Access forbidden: You do not manage this project');
    }

    projectRepository.delete(id);
    return { success: true, message: 'Project and all related tasks/assignments deleted successfully' };
  }
};

export const taskService = {
  getTasksForUser(projectId: string | undefined, userId: string, role: UserRole) {
    let tasks = taskRepository.getAll();
    if (projectId) {
      tasks = tasks.filter(t => t.project_id === projectId);
    }

    if (role === 'Employee') {
      const employeeAssignments = assignmentRepository.getByUserId(userId);
      const employeeTaskIds = employeeAssignments.map(a => a.task_id);
      tasks = tasks.filter(t => employeeTaskIds.includes(t.id));
    }

    return tasks;
  },

  getTaskById(id: string, userId: string, role: UserRole) {
    const task = taskRepository.getById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (role === 'Employee') {
      const isAssigned = assignmentRepository.getAll().some(a => a.task_id === id && a.user_id === userId);
      if (!isAssigned) {
        throw new Error('Access forbidden: You are not assigned to this task');
      }
    }

    return task;
  },

  createTask(projectId: string, title: string, description: string, priority: TaskPriority, deadline: string) {
    const project = projectRepository.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newTask: Task = {
      id: 'task_' + Date.now(),
      project_id: projectId,
      title,
      description,
      priority,
      status: 'Pending',
      deadline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return taskRepository.create(newTask);
  },

  updateTask(id: string, updates: Partial<Task>, userId: string, role: UserRole) {
    const task = taskRepository.getById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (role === 'Employee') {
      const isAssigned = assignmentRepository.getAll().some(a => a.task_id === id && a.user_id === userId);
      if (!isAssigned) {
        throw new Error('Access forbidden: You are not assigned to this task');
      }
      // Employees can ONLY update the status
      const allowedUpdates: Partial<Task> = {};
      if (updates.status) {
        allowedUpdates.status = updates.status;
      }
      return taskRepository.update(id, allowedUpdates);
    }

    return taskRepository.update(id, updates);
  },

  deleteTask(id: string) {
    const deleted = taskRepository.delete(id);
    if (!deleted) {
      throw new Error('Task not found');
    }
    return { success: true, message: 'Task deleted successfully' };
  }
};

export const assignmentService = {
  getAssignments() {
    return assignmentRepository.getAll();
  },

  assignTask(taskId: string, userId: string) {
    const task = taskRepository.getById(taskId);
    const user = userRepository.getById(userId);

    if (!task || !user) {
      throw new Error('Task or User not found');
    }

    const newAssignment: TaskAssignment = {
      id: 'assign_' + Date.now(),
      task_id: taskId,
      user_id: userId,
      assigned_at: new Date().toISOString()
    };

    return assignmentRepository.create(newAssignment);
  },

  getAssignmentsByUserId(userId: string) {
    return assignmentRepository.getByUserId(userId);
  }
};

export const dashboardService = {
  getDashboardStats(userId: string, role: UserRole) {
    const users = userRepository.getAll();
    const projects = projectRepository.getAll();
    const tasks = taskRepository.getAll();
    const assignments = assignmentRepository.getAll();

    if (role === 'Administrator') {
      const totalUsers = users.length;
      const totalProjects = projects.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
      
      return {
        administrator: {
          totalUsers,
          totalProjects,
          completedTasks,
          pendingTasks
        }
      };
    }

    if (role === 'Project Manager') {
      const pmProjects = projects.filter(p => p.manager_id === userId);
      const pmProjectIds = pmProjects.map(p => p.id);
      const activeProjects = pmProjects.filter(p => p.status === 'Active').length;
      
      const pmTasks = tasks.filter(t => pmProjectIds.includes(t.project_id));
      const completedPMTasks = pmTasks.filter(t => t.status === 'Completed').length;
      const teamProgress = pmTasks.length > 0 ? Math.round((completedPMTasks / pmTasks.length) * 100) : 0;
      
      const upcomingDeadlines = pmTasks
        .filter(t => t.status !== 'Completed')
        .map(t => {
          const project = projects.find(p => p.id === t.project_id);
          return {
            taskId: t.id,
            taskTitle: t.title,
            projectTitle: project ? project.title : 'Unknown Project',
            deadline: t.deadline,
            priority: t.priority
          };
        })
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5);
        
      return {
        projectManager: {
          activeProjects,
          teamProgress,
          upcomingDeadlines
        }
      };
    }

    if (role === 'Employee') {
      const employeeAssignments = assignments.filter(a => a.user_id === userId);
      const employeeTaskIds = employeeAssignments.map(a => a.task_id);
      const employeeTasks = tasks.filter(t => employeeTaskIds.includes(t.id));
      
      const assignedTasksCount = employeeTasks.length;
      const completedTasksCount = employeeTasks.filter(t => t.status === 'Completed').length;
      
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueSoonCount = employeeTasks.filter(t => {
        if (t.status === 'Completed') return false;
        const deadlineDate = new Date(t.deadline);
        return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
      }).length;
      
      return {
        employee: {
          assignedTasksCount,
          completedTasksCount,
          dueSoonCount
        }
      };
    }

    throw new Error('Invalid user role');
  }
};
