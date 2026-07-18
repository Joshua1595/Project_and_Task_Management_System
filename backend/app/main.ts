import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config({ override: true });

import { setDB } from './db/memoryStore';
import { dbAdapter } from './db/adapter';
import { UserRole } from './models';

// Import modular API routes
import authRouter from './api/auth';
import usersRouter from './api/users';
import projectsRouter from './api/projects';
import tasksRouter from './api/tasks';
import assignmentsRouter from './api/assignments';
import dashboardRouter from './api/dashboard';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
    }
  }
}

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Enable Zero-Dependency CORS for cross-origin frontend-to-backend requests in production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mount Modular API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/dashboard', dashboardRouter);

// ---------------------- VITE AND STATIC ASSETS ----------------------

async function startServer() {
  // Preload database from cloud-native Firestore persistent layer on start
  try {
    console.log("Preloading database from cloud-native Firestore layer...");
    const users = await dbAdapter.getUsers();
    const projects = await dbAdapter.getProjects();
    const tasks = await dbAdapter.getTasks();
    const assignments = await dbAdapter.getAssignments();
    setDB({ users, projects, tasks, assignments });
    console.log(`Database preloaded successfully. Users: ${users.length}, Projects: ${projects.length}, Tasks: ${tasks.length}, Assignments: ${assignments.length}`);
  } catch (err) {
    console.error("Failed to preload database from Firestore, using local fallback DB:", err);
    // If Firestore fails, populate memoryDB with local db.json file contents
    try {
      const DB_FILE = path.join(process.cwd(), 'db.json');
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        setDB(JSON.parse(content));
        console.log("Loaded fallback from local db.json.");
      } else {
        console.warn("No db.json fallback found. Using empty database skeleton.");
        setDB({ users: [], projects: [], tasks: [], assignments: [] });
      }
    } catch (fallbackErr) {
      console.error("Critical: Failed to load even local fallback DB:", fallbackErr);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
