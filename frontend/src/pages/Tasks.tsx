import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Project, User, Task, TaskPriority, TaskStatus, TaskAssignment } from '../types';
import { 
  CheckSquare, Plus, Search, Calendar, User as UserIcon, 
  Trash2, Edit, AlertCircle, Check, X, Filter, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<Omit<User, 'password_hash'>[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State (Create/Edit)
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');

  // Form State (Assign)
  const [assigneeId, setAssigneeId] = useState('');

  const canManage = user?.role === 'Administrator' || user?.role === 'Project Manager';

  const loadTasksData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, usersData, assignmentsData] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
        api.getUsers(),
        api.getAssignments()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
      setAssignments(assignmentsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load tasks database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title || !description || !priority || !deadline) return;

    try {
      await api.createTask({
        project_id: projectId,
        title,
        description,
        priority,
        deadline
      });
      setIsCreateOpen(false);
      resetForm();
      loadTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setProjectId(task.project_id);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setStatus(task.status);
    setIsEditOpen(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !projectId || !title || !description || !priority || !deadline) return;

    try {
      await api.updateTask(selectedTask.id, {
        project_id: projectId,
        title,
        description,
        priority,
        status,
        deadline
      });
      setIsEditOpen(false);
      resetForm();
      loadTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleUpdateStatusInline = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteTask(deleteConfirmId);
      loadTasksData();
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
      setDeleteConfirmId(null);
    }
  };

  const handleOpenAssign = (task: Task) => {
    setSelectedTask(task);
    // Find current assignee
    const existingAssign = assignments.find(a => a.task_id === task.id);
    setAssigneeId(existingAssign ? existingAssign.user_id : '');
    setIsAssignOpen(true);
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !assigneeId) return;

    try {
      await api.assignTask(selectedTask.id, assigneeId);
      setIsAssignOpen(false);
      loadTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign task');
    }
  };

  const resetForm = () => {
    setProjectId(projects[0]?.id || '');
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDeadline('');
    setStatus('Pending');
    setAssigneeId('');
    setSelectedTask(null);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesProject = projectFilter === 'All' || t.project_id === projectFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesProject && matchesStatus && matchesPriority;
  });

  const getProjectTitle = (pId: string) => {
    const proj = projects.find(p => p.id === pId);
    return proj ? proj.title : 'External Project';
  };

  const getTaskAssignee = (taskId: string) => {
    const assignment = assignments.find(a => a.task_id === taskId);
    if (!assignment) return null;
    return users.find(u => u.id === assignment.user_id);
  };

  const getPriorityBadgeColor = (prio: TaskPriority) => {
    switch (prio) {
      case 'High': return 'bg-red-50 text-red-700 border-red-150';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'Low': return 'bg-slate-100 text-slate-650 border-slate-200';
    }
  };

  const getStatusBadgeColor = (st: TaskStatus) => {
    switch (st) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Search and Filters Section */}
      <div className="bg-white p-5 border border-slate-150 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="task-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Search tasks..."
            />
          </div>

          {canManage && (
            <button
              id="task-create-modal-btn"
              onClick={() => { resetForm(); setIsCreateOpen(true); }}
              className="w-full md:w-auto flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4.5 w-4.5 mr-1.5" />
              New Task
            </button>
          )}
        </div>

        {/* Extended Filters Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Project Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="filter-proj" className="text-slate-400">Project:</label>
            <select
              id="filter-proj"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 border-transparent rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="filter-status" className="text-slate-400">Status:</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-100 hover:bg-slate-200 border-transparent rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="filter-prio" className="text-slate-400">Priority:</label>
            <select
              id="filter-prio"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-slate-100 hover:bg-slate-200 border-transparent rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks Table / Board List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl shadow-xs">
          <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-900">No tasks created</h3>
          <p className="text-slate-500 text-sm mt-1">Try adapting filters or adding your first team task.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const assignee = getTaskAssignee(task.id);
              const isOverdue = new Date(task.deadline).getTime() < Date.now() && task.status !== 'Completed';
              
              return (
                <div 
                  key={task.id} 
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/40 transition-all group"
                >
                  <div className="space-y-2 max-w-2xl flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xxs font-extrabold text-slate-450 uppercase tracking-widest bg-slate-100 border border-slate-200/55 rounded px-2 py-0.5 max-w-xs truncate">
                        {getProjectTitle(task.project_id)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xxs font-extrabold border uppercase tracking-wider ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {task.title}
                    </h4>
                    
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                      <span className={`flex items-center ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Deadline: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {isOverdue && <span className="ml-1.5 text-xxs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-extrabold border border-red-100">Overdue</span>}
                      </span>
                      
                      <span>•</span>

                      {/* Display Assignee */}
                      <span className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1.5 text-slate-405" />
                        Assignee:{' '}
                        {assignee ? (
                          <span className="text-slate-600 font-bold ml-1 flex items-center">
                            <img 
                              src={assignee.profile_image} 
                              alt={assignee.full_name} 
                              className="h-4.5 w-4.5 rounded-full object-cover border border-slate-200 mr-1.5 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            {assignee.full_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium italic ml-1">Unassigned</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right side controls: status selectors & edits */}
                  <div className="flex flex-wrap items-center gap-4 self-end md:self-center shrink-0">
                    
                    {/* Status inline selector */}
                    <div className="flex items-center space-x-1">
                      <select
                        id={`task-status-selector-${task.id}`}
                        value={task.status}
                        onChange={(e) => handleUpdateStatusInline(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-bold border rounded-xl px-3 py-2.5 bg-white shadow-3xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeColor(task.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Manage Buttons */}
                    {canManage && (
                      <div className="flex items-center border-l border-slate-200 pl-4 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`task-assign-btn-${task.id}`}
                          onClick={() => handleOpenAssign(task)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                          title="Assign Employee"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button
                          id={`task-edit-btn-${task.id}`}
                          onClick={() => handleOpenEdit(task)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Edit Task Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          id={`task-delete-btn-${task.id}`}
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsCreateOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-lg w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-lg text-slate-900">Create New Task</h3>
                <button 
                  id="task-create-close-btn"
                  onClick={() => setIsCreateOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-5">
                <div>
                  <label htmlFor="t-project" className="block text-sm font-semibold text-slate-700">Project Portfolio</label>
                  <select
                    id="t-project"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="" disabled>Select Project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="t-title" className="block text-sm font-semibold text-slate-700">Task Title</label>
                  <input
                    id="t-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Implement user schemas"
                  />
                </div>

                <div>
                  <label htmlFor="t-desc" className="block text-sm font-semibold text-slate-700">Instructions / Description</label>
                  <textarea
                    id="t-desc"
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain what needs to be done, definitions of complete..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="t-priority" className="block text-sm font-semibold text-slate-700">Priority Level</label>
                    <select
                      id="t-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="t-deadline" className="block text-sm font-semibold text-slate-700">Deadline</label>
                    <input
                      id="t-deadline"
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="task-create-cancel-btn"
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="task-create-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TASK MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsEditOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-lg w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-lg text-slate-900">Edit Task Details</h3>
                <button 
                  id="task-edit-close-btn"
                  onClick={() => setIsEditOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditTask} className="p-6 space-y-5">
                <div>
                  <label htmlFor="te-project" className="block text-sm font-semibold text-slate-700">Project Portfolio</label>
                  <select
                    id="te-project"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="te-title" className="block text-sm font-semibold text-slate-700">Task Title</label>
                  <input
                    id="te-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="te-desc" className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    id="te-desc"
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="te-priority" className="block text-sm font-semibold text-slate-700">Priority Level</label>
                    <select
                      id="te-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="te-deadline" className="block text-sm font-semibold text-slate-700">Deadline</label>
                    <input
                      id="te-deadline"
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="te-status" className="block text-sm font-semibold text-slate-700">Task Status</label>
                  <select
                    id="te-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="task-edit-cancel-btn"
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="task-edit-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN EMPLOYEE MODAL */}
      <AnimatePresence>
        {isAssignOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsAssignOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-sm w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-lg text-slate-900">Assign Employee</h3>
                <button 
                  id="task-assign-close-btn"
                  onClick={() => setIsAssignOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAssignTask} className="p-6 space-y-5">
                <div>
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Assigning to Task:</span>
                  <p className="font-bold text-sm text-slate-800 mt-1 leading-snug">{selectedTask.title}</p>
                </div>

                <div>
                  <label htmlFor="ta-assignee" className="block text-sm font-semibold text-slate-700">Select Employee</label>
                  <select
                    id="ta-assignee"
                    required
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="" disabled>Select Team Member...</option>
                    {users
                      .filter(u => u.role === 'Employee')
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="task-assign-cancel-btn"
                    type="button"
                    onClick={() => setIsAssignOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="task-assign-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setDeleteConfirmId(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full overflow-hidden relative z-10 p-6 space-y-5"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Delete Task?</h3>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    Are you sure you want to delete this task? This will permanently delete the task and its assignment. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  id="task-delete-cancel-btn"
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="task-delete-confirm-btn"
                  type="button"
                  onClick={confirmDeleteTask}
                  className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 shadow-xs cursor-pointer"
                >
                  Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
