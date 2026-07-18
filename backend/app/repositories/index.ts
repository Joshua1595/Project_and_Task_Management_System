import { getDB, saveDB } from '../db/memoryStore';
import { User, Project, Task, TaskAssignment } from '../models';

export const userRepository = {
  getById(id: string): User | null {
    const db = getDB();
    return db.users.find(u => u.id === id) || null;
  },

  getByEmail(email: string): User | null {
    const db = getDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getAll(): User[] {
    const db = getDB();
    return db.users;
  },

  create(user: User): User {
    const db = getDB();
    db.users.push(user);
    saveDB(db);
    return user;
  },

  update(id: string, updates: Partial<User>): User | null {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const updatedUser = {
      ...db.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    db.users[index] = updatedUser;
    saveDB(db);
    return updatedUser;
  },

  delete(id: string): boolean {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    db.users.splice(index, 1);
    // Cascade delete assignments for the deleted user
    db.assignments = db.assignments.filter(a => a.user_id !== id);
    saveDB(db);
    return true;
  }
};

export const projectRepository = {
  getById(id: string): Project | null {
    const db = getDB();
    return db.projects.find(p => p.id === id) || null;
  },

  getAll(): Project[] {
    const db = getDB();
    return db.projects;
  },

  create(project: Project): Project {
    const db = getDB();
    db.projects.push(project);
    saveDB(db);
    return project;
  },

  update(id: string, updates: Partial<Project>): Project | null {
    const db = getDB();
    const index = db.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = {
      ...db.projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    db.projects[index] = updatedProject;
    saveDB(db);
    return updatedProject;
  },

  delete(id: string): boolean {
    const db = getDB();
    const index = db.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    // Remove the project
    db.projects.splice(index, 1);
    
    // Find related tasks
    const relatedTasks = db.tasks.filter(t => t.project_id === id);
    const relatedTaskIds = relatedTasks.map(t => t.id);

    // Cascade delete related tasks and their assignments
    db.tasks = db.tasks.filter(t => t.project_id !== id);
    db.assignments = db.assignments.filter(a => !relatedTaskIds.includes(a.task_id));

    saveDB(db);
    return true;
  }
};

export const taskRepository = {
  getById(id: string): Task | null {
    const db = getDB();
    return db.tasks.find(t => t.id === id) || null;
  },

  getByProjectId(projectId: string): Task[] {
    const db = getDB();
    return db.tasks.filter(t => t.project_id === projectId);
  },

  getAll(): Task[] {
    const db = getDB();
    return db.tasks;
  },

  create(task: Task): Task {
    const db = getDB();
    db.tasks.push(task);
    saveDB(db);
    return task;
  },

  update(id: string, updates: Partial<Task>): Task | null {
    const db = getDB();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTask = {
      ...db.tasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    db.tasks[index] = updatedTask;
    saveDB(db);
    return updatedTask;
  },

  delete(id: string): boolean {
    const db = getDB();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    db.tasks.splice(index, 1);
    // Cascade delete task assignments
    db.assignments = db.assignments.filter(a => a.task_id !== id);
    saveDB(db);
    return true;
  }
};

export const assignmentRepository = {
  getAll(): TaskAssignment[] {
    const db = getDB();
    return db.assignments;
  },

  getByTaskId(taskId: string): TaskAssignment | null {
    const db = getDB();
    return db.assignments.find(a => a.task_id === taskId) || null;
  },

  getByUserId(userId: string): TaskAssignment[] {
    const db = getDB();
    return db.assignments.filter(a => a.user_id === userId);
  },

  create(assignment: TaskAssignment): TaskAssignment {
    const db = getDB();
    // Ensure one assignment per task to avoid duplication
    db.assignments = db.assignments.filter(a => a.task_id !== assignment.task_id);
    db.assignments.push(assignment);
    saveDB(db);
    return assignment;
  },

  deleteByTaskId(taskId: string): boolean {
    const db = getDB();
    const lenBefore = db.assignments.length;
    db.assignments = db.assignments.filter(a => a.task_id !== taskId);
    const deleted = db.assignments.length < lenBefore;
    if (deleted) {
      saveDB(db);
    }
    return deleted;
  }
};
