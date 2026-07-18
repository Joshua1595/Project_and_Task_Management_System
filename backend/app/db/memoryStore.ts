import { DatabaseSchema } from '../models';
import { dbAdapter } from './adapter';

let memoryDB: DatabaseSchema = {
  users: [],
  projects: [],
  tasks: [],
  assignments: []
};

export function getDB(): DatabaseSchema {
  return memoryDB;
}

export function setDB(db: DatabaseSchema): void {
  memoryDB = db;
}

export function saveDB(db: DatabaseSchema): void {
  memoryDB = db;
  // Trigger background cloud synchronization asynchronously without blocking HTTP requests
  syncToCloud(db).catch(err => {
    console.error("Async background cloud synchronization failed:", err);
  });
}

// Background cloud synchronization
export async function syncToCloud(db: DatabaseSchema) {
  try {
    // 1. Sync users
    for (const u of db.users) {
      await dbAdapter.saveUser(u);
    }
    const currentUsers = await dbAdapter.getUsers();
    const memoryUserIds = db.users.map(u => u.id);
    for (const cu of currentUsers) {
      if (!memoryUserIds.includes(cu.id)) {
        await dbAdapter.deleteUser(cu.id);
      }
    }

    // 2. Sync projects
    for (const p of db.projects) {
      await dbAdapter.saveProject(p);
    }
    const currentProjects = await dbAdapter.getProjects();
    const memoryProjectIds = db.projects.map(p => p.id);
    for (const cp of currentProjects) {
      if (!memoryProjectIds.includes(cp.id)) {
        await dbAdapter.deleteProject(cp.id);
      }
    }

    // 3. Sync tasks
    for (const t of db.tasks) {
      await dbAdapter.saveTask(t);
    }
    const currentTasks = await dbAdapter.getTasks();
    const memoryTaskIds = db.tasks.map(t => t.id);
    for (const ct of currentTasks) {
      if (!memoryTaskIds.includes(ct.id)) {
        await dbAdapter.deleteTask(ct.id);
      }
    }

    // 4. Sync assignments
    for (const a of db.assignments) {
      await dbAdapter.saveAssignment(a);
    }
    const currentAssignments = await dbAdapter.getAssignments();
    const memoryAssignIds = db.assignments.map(a => a.id);
    for (const ca of currentAssignments) {
      if (!memoryAssignIds.includes(ca.id)) {
        await dbAdapter.deleteAssignment(ca.id);
      }
    }
    console.log("Background Firestore sync completed successfully.");
  } catch (err) {
    console.error("Error during Firestore collection synchronization:", err);
  }
}
