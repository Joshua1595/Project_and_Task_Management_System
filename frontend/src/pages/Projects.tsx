import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Project, User, ProjectStatus } from '../types';
import { 
  FolderKanban, Plus, Search, Calendar, User as UserIcon, 
  Trash2, Edit, AlertCircle, Archive, CheckCircle, Clock, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<Omit<User, 'password_hash'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  
  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');

  const canManage = user?.role === 'Administrator' || user?.role === 'Project Manager';

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      const projData = await api.getProjects();
      setProjects(projData);
      
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectsData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) return;
    
    try {
      await api.createProject({
        title,
        description,
        start_date: startDate,
        end_date: endDate
      });
      setIsCreateOpen(false);
      resetForm();
      loadProjectsData();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    }
  };

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setStartDate(project.start_date);
    setEndDate(project.end_date);
    setStatus(project.status);
    setIsEditOpen(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !title || !description || !startDate || !endDate) return;

    try {
      await api.updateProject(selectedProject.id, {
        title,
        description,
        status,
        start_date: startDate,
        end_date: endDate
      });
      setIsEditOpen(false);
      resetForm();
      loadProjectsData();
    } catch (err: any) {
      alert(err.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteProject(deleteConfirmId);
      loadProjectsData();
      if (selectedProject?.id === deleteConfirmId) {
        setIsDetailOpen(false);
      }
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
      setDeleteConfirmId(null);
    }
  };

  const handleOpenDetail = async (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
    try {
      // Load tasks specifically for this project
      const tasks = await api.getTasks(project.id);
      setProjectTasks(tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setStatus('Active');
    setSelectedProject(null);
  };

  // Filter Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPMName = (managerId: string) => {
    const pm = users.find(u => u.id === managerId);
    return pm ? pm.full_name : 'External Manager';
  };

  const getStatusBadgeColor = (pStatus: ProjectStatus) => {
    switch (pStatus) {
      case 'Active': return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Archived': return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar with filters and Add Project Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="project-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search projects by title or keywords..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['All', 'Active', 'Completed', 'Archived'] as const).map((filter) => (
              <button
                id={`project-filter-${filter.toLowerCase()}`}
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === filter 
                    ? 'bg-white text-slate-900 shadow-3xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {canManage && (
            <button
              id="project-create-modal-btn"
              onClick={() => { resetForm(); setIsCreateOpen(true); }}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="h-4.5 w-4.5 mr-1.5" />
              New Project
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl">
          <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-900">No projects found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or query parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-3xl border border-slate-150 hover:border-slate-250 hover:shadow-2xs transition-all p-6 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Card Body */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                  
                  {/* Actions (PM who manages or Admin can edit/delete) */}
                  {canManage && (user?.role === 'Administrator' || project.manager_id === user?.id) && (
                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        id={`project-edit-btn-${project.id}`}
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(project); }}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        id={`project-delete-btn-${project.id}`}
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.title}</h3>
                  <p className="text-slate-500 text-sm mt-1.5 line-clamp-3 leading-relaxed">{project.description}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="space-y-1 text-xs text-slate-500">
                  <p className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-450" />
                    Due: {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="flex items-center">
                    <UserIcon className="h-3.5 w-3.5 mr-1.5 text-slate-450" />
                    PM: <span className="font-semibold text-slate-600 ml-1">{getPMName(project.manager_id)}</span>
                  </p>
                </div>

                <button
                  id={`project-details-btn-${project.id}`}
                  onClick={() => handleOpenDetail(project)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center cursor-pointer transition-colors"
                >
                  <Info className="h-3.5 w-3.5 mr-1 text-slate-500" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
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
                <h3 className="font-extrabold text-lg text-slate-900">Create New Project</h3>
                <button 
                  id="project-create-close-btn"
                  onClick={() => setIsCreateOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                <div>
                  <label htmlFor="p-title" className="block text-sm font-semibold text-slate-700">Project Title</label>
                  <input
                    id="p-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Website Redesign"
                  />
                </div>

                <div>
                  <label htmlFor="p-desc" className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    id="p-desc"
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide a high level brief of the project goals..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-start" className="block text-sm font-semibold text-slate-700">Start Date</label>
                    <input
                      id="p-start"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-end" className="block text-sm font-semibold text-slate-700">Target End Date</label>
                    <input
                      id="p-end"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="project-create-cancel-btn"
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="project-create-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROJECT MODAL */}
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
                <h3 className="font-extrabold text-lg text-slate-900">Edit Project</h3>
                <button 
                  id="project-edit-close-btn"
                  onClick={() => setIsEditOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditProject} className="p-6 space-y-5">
                <div>
                  <label htmlFor="pe-title" className="block text-sm font-semibold text-slate-700">Project Title</label>
                  <input
                    id="pe-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="pe-desc" className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    id="pe-desc"
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pe-start" className="block text-sm font-semibold text-slate-700">Start Date</label>
                    <input
                      id="pe-start"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="pe-end" className="block text-sm font-semibold text-slate-700">Target End Date</label>
                    <input
                      id="pe-end"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pe-status" className="block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    id="pe-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="project-edit-cancel-btn"
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="project-edit-submit-btn"
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

      {/* PROJECT DETAILS DRAWER / MODAL */}
      <AnimatePresence>
        {isDetailOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsDetailOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white h-full md:h-[calc(100vh-2rem)] md:rounded-3xl border-l border-slate-200 md:border border-slate-150 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col relative z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-bold border ${getStatusBadgeColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                  <h3 className="font-extrabold text-xl text-slate-900 mt-1">{selectedProject.title}</h3>
                </div>
                <button 
                  id="project-details-close-btn"
                  onClick={() => setIsDetailOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Description</h4>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Start Date</h5>
                    <p className="mt-1 font-bold text-slate-800">{new Date(selectedProject.start_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Target Completion</h5>
                    <p className="mt-1 font-bold text-slate-800">{new Date(selectedProject.end_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tasks in Project ({projectTasks.length})</h4>
                  
                  {projectTasks.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-450">
                      No tasks created for this project yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectTasks.map((t: any) => (
                        <div key={t.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{t.title}</span>
                            <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                              t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                              t.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' :
                              'bg-slate-100 text-slate-650'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                  <h3 className="font-extrabold text-lg text-slate-900">Delete Project?</h3>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    Are you sure you want to delete this project? This will permanently delete the project and all of its tasks and assignments. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  id="project-delete-cancel-btn"
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="project-delete-confirm-btn"
                  type="button"
                  onClick={confirmDeleteProject}
                  className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 shadow-xs cursor-pointer"
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
