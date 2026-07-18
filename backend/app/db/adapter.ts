import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { 
  User, Project, Task, TaskAssignment, 
  UserRole, ProjectStatus, TaskPriority, TaskStatus 
} from '../models';

dotenv.config({ override: true });

const DB_FILE = path.join(process.cwd(), 'db.json');

// Simple password hashing function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function hashPassword(password: string): string {
  return 'hashed_' + simpleHash(password);
}

interface DBStructure {
  users: User[];
  projects: Project[];
  tasks: Task[];
  assignments: TaskAssignment[];
}

// Initial Seed Data
const initialDB: DBStructure = {
  users: [
    {
      id: 'admin-1',
      full_name: 'Sarah Connor',
      email: 'admin@company.com',
      password_hash: hashPassword('admin123'),
      role: 'Administrator' as UserRole,
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      is_active: true,
      created_at: new Date('2026-01-10T08:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T08:00:00Z').toISOString()
    },
    {
      id: 'pm-1',
      full_name: 'John Doe',
      email: 'pm@company.com',
      password_hash: hashPassword('pm123'),
      role: 'Project Manager' as UserRole,
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      is_active: true,
      created_at: new Date('2026-01-15T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-15T09:00:00Z').toISOString()
    },
    {
      id: 'emp-1',
      full_name: 'Alice Smith',
      email: 'emp1@company.com',
      password_hash: hashPassword('emp123'),
      role: 'Employee' as UserRole,
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      is_active: true,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString()
    },
    {
      id: 'emp-2',
      full_name: 'Bob Jones',
      email: 'emp2@company.com',
      password_hash: hashPassword('emp123'),
      role: 'Employee' as UserRole,
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      is_active: true,
      created_at: new Date('2026-02-05T11:00:00Z').toISOString(),
      updated_at: new Date('2026-02-05T11:00:00Z').toISOString()
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Smart Corporate Web Portal',
      description: 'Redesigning and launching the core enterprise web portal with custom integration APIs and modern dashboards.',
      status: 'Active' as ProjectStatus,
      start_date: '2026-07-01',
      end_date: '2026-08-30',
      manager_id: 'pm-1',
      created_at: new Date('2026-07-01T09:00:00Z').toISOString(),
      updated_at: new Date('2026-07-01T09:00:00Z').toISOString()
    },
    {
      id: 'proj-2',
      title: 'Mobile App Suite',
      description: 'Developing highly optimized, multi-platform iOS and Android apps for mobile customers.',
      status: 'Active' as ProjectStatus,
      start_date: '2026-07-10',
      end_date: '2026-10-15',
      manager_id: 'pm-1',
      created_at: new Date('2026-07-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-07-10T10:00:00Z').toISOString()
    },
    {
      id: 'proj-3',
      title: 'Cloud Security Audit',
      description: 'Comprehensive analysis of container infrastructure, role policies, and network firewall configurations.',
      status: 'Completed' as ProjectStatus,
      start_date: '2026-06-01',
      end_date: '2026-07-15',
      manager_id: 'pm-1',
      created_at: new Date('2026-06-01T08:00:00Z').toISOString(),
      updated_at: new Date('2026-07-15T17:00:00Z').toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      project_id: 'proj-1',
      title: 'Figma Design and Wireframing',
      description: 'Deliver responsive website designs for mobile, tablet, and widescreen desktop layouts.',
      priority: 'High' as TaskPriority,
      status: 'Completed' as TaskStatus,
      deadline: '2026-07-15',
      created_at: new Date('2026-07-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-07-15T14:30:00Z').toISOString()
    },
    {
      id: 'task-2',
      project_id: 'proj-1',
      title: 'Develop Responsive React Frontend',
      description: 'Build core page structures, components, and layout animations using Tailwind CSS and Motion.',
      priority: 'High' as TaskPriority,
      status: 'In Progress' as TaskStatus,
      deadline: '2026-07-25',
      created_at: new Date('2026-07-01T11:00:00Z').toISOString(),
      updated_at: new Date('2026-07-17T11:00:00Z').toISOString()
    },
    {
      id: 'task-3',
      project_id: 'proj-1',
      title: 'REST API & Authentication Setup',
      description: 'Create scalable API endpoints, mount middleware token guards, and wire up database handlers.',
      priority: 'Medium' as TaskPriority,
      status: 'Pending' as TaskStatus,
      deadline: '2026-08-05',
      created_at: new Date('2026-07-01T12:00:00Z').toISOString(),
      updated_at: new Date('2026-07-01T12:00:00Z').toISOString()
    },
    {
      id: 'task-4',
      project_id: 'proj-2',
      title: 'iOS App Shell & Push Setup',
      description: 'Bootstrap Swift-based native container shell and integrate developer credentials for notification service.',
      priority: 'High' as TaskPriority,
      status: 'In Progress' as TaskStatus,
      deadline: '2026-08-01',
      created_at: new Date('2026-07-10T11:00:00Z').toISOString(),
      updated_at: new Date('2026-07-12T09:00:00Z').toISOString()
    },
    {
      id: 'task-5',
      project_id: 'proj-2',
      title: 'Configure Play Store Listings',
      description: 'Publish app screenshots, privacy guidelines, terms of service, and developer credentials.',
      priority: 'Low' as TaskPriority,
      status: 'Pending' as TaskStatus,
      deadline: '2026-09-10',
      created_at: new Date('2026-07-10T12:00:00Z').toISOString(),
      updated_at: new Date('2026-07-10T12:00:00Z').toISOString()
    }
  ],
  assignments: [
    {
      id: 'assign-1',
      task_id: 'task-1',
      user_id: 'emp-1',
      assigned_at: new Date('2026-07-02T09:00:00Z').toISOString()
    },
    {
      id: 'assign-2',
      task_id: 'task-2',
      user_id: 'emp-1',
      assigned_at: new Date('2026-07-02T10:00:00Z').toISOString()
    },
    {
      id: 'assign-3',
      task_id: 'task-3',
      user_id: 'emp-2',
      assigned_at: new Date('2026-07-03T09:00:00Z').toISOString()
    },
    {
      id: 'assign-4',
      task_id: 'task-4',
      user_id: 'emp-2',
      assigned_at: new Date('2026-07-11T10:00:00Z').toISOString()
    }
  ]
};

let supabase: any = null;

let supabaseUrl = process.env.PROJECT_URL || process.env.SUPABASE_URL;
if (supabaseUrl && supabaseUrl.includes('your-supabase-project')) {
  if (process.env.PROJECT_URL && !process.env.PROJECT_URL.includes('your-supabase-project')) {
    supabaseUrl = process.env.PROJECT_URL;
  } else if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-supabase-project')) {
    supabaseUrl = process.env.SUPABASE_URL;
  }
}
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-supabase-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    console.log(`Supabase client successfully initialized for URL: ${supabaseUrl}`);
  } catch (error) {
    console.warn('Supabase initialization failed.', error);
  }
} else {
  console.log('No valid supabase configuration found. Defaulting to local file database.');
}

// Local file database helpers
function getLocalDB(): typeof initialDB {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
}

function saveLocalDB(db: any): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Cloud persistence API
export const dbAdapter = {
  async getUsers(): Promise<User[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding initial users to Supabase...');
            const seedSource = getLocalDB().users;
            for (const user of seedSource) {
              await supabase.from('users').upsert(user);
            }
            return seedSource;
          }
          return data as User[];
        }
      } catch (err) {
        console.warn('Supabase error in getUsers, trying local...', err);
      }
    }
    return getLocalDB().users;
  },

  async saveUser(user: User): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('users').upsert(user);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase error in saveUser:', err);
      }
    }
    const db = getLocalDB();
    const idx = db.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      db.users[idx] = user;
    } else {
      db.users.push(user);
    }
    saveLocalDB(db);
  },

  async deleteUser(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id);
        await supabase.from('assignments').delete().eq('user_id', id);
        return;
      } catch (err) {
        console.warn('Supabase error in deleteUser:', err);
      }
    }
    const db = getLocalDB();
    db.users = db.users.filter(u => u.id !== id);
    db.assignments = db.assignments.filter(a => a.user_id !== id);
    saveLocalDB(db);
  },

  async getProjects(): Promise<Project[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*');
        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding initial projects to Supabase...');
            const seedSource = getLocalDB().projects;
            for (const proj of seedSource) {
              await supabase.from('projects').upsert(proj);
            }
            return seedSource as Project[];
          }
          return data as Project[];
        }
      } catch (err) {
        console.warn('Supabase error in getProjects:', err);
      }
    }
    return getLocalDB().projects;
  },

  async saveProject(project: Project): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('projects').upsert(project);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase error in saveProject:', err);
      }
    }
    const db = getLocalDB();
    const idx = db.projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      db.projects[idx] = project;
    } else {
      db.projects.push(project);
    }
    saveLocalDB(db);
  },

  async deleteProject(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
        const { data: tasks } = await supabase.from('tasks').select('id').eq('project_id', id);
        await supabase.from('tasks').delete().eq('project_id', id);
        if (tasks && tasks.length > 0) {
          const taskIds = tasks.map((t: any) => t.id);
          await supabase.from('assignments').delete().in('task_id', taskIds);
        }
        return;
      } catch (err) {
        console.warn('Supabase error in deleteProject:', err);
      }
    }
    const db = getLocalDB();
    db.projects = db.projects.filter(p => p.id !== id);
    const projectTasks = db.tasks.filter(t => t.project_id === id);
    const projectTaskIds = projectTasks.map(t => t.id);
    db.tasks = db.tasks.filter(t => t.project_id !== id);
    db.assignments = db.assignments.filter(a => !projectTaskIds.includes(a.task_id));
    saveLocalDB(db);
  },

  async getTasks(): Promise<Task[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('*');
        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding initial tasks to Supabase...');
            const seedSource = getLocalDB().tasks;
            for (const task of seedSource) {
              await supabase.from('tasks').upsert(task);
            }
            return seedSource as Task[];
          }
          return data as Task[];
        }
      } catch (err) {
        console.warn('Supabase error in getTasks:', err);
      }
    }
    return getLocalDB().tasks as Task[];
  },

  async saveTask(task: Task): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('tasks').upsert(task);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase error in saveTask:', err);
      }
    }
    const db = getLocalDB();
    const idx = db.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      db.tasks[idx] = task;
    } else {
      db.tasks.push(task);
    }
    saveLocalDB(db);
  },

  async deleteTask(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
        await supabase.from('assignments').delete().eq('task_id', id);
        return;
      } catch (err) {
        console.warn('Supabase error in deleteTask:', err);
      }
    }
    const db = getLocalDB();
    db.tasks = db.tasks.filter(t => t.id !== id);
    db.assignments = db.assignments.filter(a => a.task_id !== id);
    saveLocalDB(db);
  },

  async getAssignments(): Promise<TaskAssignment[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('assignments').select('*');
        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding initial assignments to Supabase...');
            const seedSource = getLocalDB().assignments;
            for (const assign of seedSource) {
              await supabase.from('assignments').upsert(assign);
            }
            return seedSource;
          }
          return data as TaskAssignment[];
        }
      } catch (err) {
        console.warn('Supabase error in getAssignments:', err);
      }
    }
    return getLocalDB().assignments;
  },

  async saveAssignment(assignment: TaskAssignment): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('assignments').upsert(assignment);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase error in saveAssignment:', err);
      }
    }
    const db = getLocalDB();
    const idx = db.assignments.findIndex(a => a.id === assignment.id);
    if (idx !== -1) {
      db.assignments[idx] = assignment;
    } else {
      db.assignments.push(assignment);
    }
    saveLocalDB(db);
  },

  async deleteAssignment(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('assignments').delete().eq('id', id);
        return;
      } catch (err) {
        console.warn('Supabase error in deleteAssignment:', err);
      }
    }
    const db = getLocalDB();
    db.assignments = db.assignments.filter(a => a.id !== id);
    saveLocalDB(db);
  },

  async removeAssignmentsForTask(taskId: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('assignments').delete().eq('task_id', taskId);
        return;
      } catch (err) {
        console.warn('Supabase error in removeAssignmentsForTask:', err);
      }
    }
    const db = getLocalDB();
    db.assignments = db.assignments.filter(a => a.task_id !== taskId);
    saveLocalDB(db);
  }
};
