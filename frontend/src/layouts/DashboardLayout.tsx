import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import ProjectsPage from '../pages/Projects';
import TasksPage from '../pages/Tasks';
import UsersPage from '../pages/Users';
import ProfilePage from '../pages/Profile';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Users, User as UserIcon, 
  LogOut, Menu, X, TrendingUp, Clock, AlertTriangle, Calendar, RefreshCw,
  Contrast
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Projects' | 'Tasks' | 'Users' | 'Profile'>('Overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const [isMonochrome, setIsMonochrome] = useState(() => {
    return localStorage.getItem('theme-monochrome') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme-monochrome', String(isMonochrome));
    if (isMonochrome) {
      document.documentElement.classList.add('theme-black');
    } else {
      document.documentElement.classList.remove('theme-black');
    }
  }, [isMonochrome]);

  useEffect(() => {
    if (activeTab === 'Overview') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setStatsError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Projects':
        return <ProjectsPage />;
      case 'Tasks':
        return <TasksPage />;
      case 'Users':
        return user?.role === 'Administrator' ? <UsersPage /> : <ProjectsPage />;
      case 'Profile':
        return <ProfilePage />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (loadingStats && !stats) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8 font-sans text-slate-800">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.full_name} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is what is happening in your workspace today.
            </p>
          </div>
          <button 
            onClick={fetchStats}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>
        </div>

        {statsError && (
          <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-sm text-red-700 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{statsError}</span>
          </div>
        )}

        {/* Dynamic Roles Dashboard */}
        {user?.role === 'Administrator' && stats?.administrator && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Active Users</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.administrator.totalUsers}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Projects</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.administrator.totalProjects}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Completed Tasks</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.administrator.completedTasks}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending Tasks</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.administrator.pendingTasks}</h3>
                </div>
              </div>
            </div>

            {/* Beautiful SVG Analytics and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Progress Ring Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950">Workspace Task Distribution</h4>
                  <p className="text-xxs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">Real-time status allocation</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-around py-6 gap-6">
                  {/* Circular visual donut */}
                  <div className="relative h-36 w-36 flex items-center justify-center">
                    {(() => {
                      const total = stats.administrator.completedTasks + stats.administrator.pendingTasks;
                      const percentage = total > 0 ? Math.round((stats.administrator.completedTasks / total) * 100) : 0;
                      const radius = 50;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (percentage / 100) * circumference;
                      return (
                        <>
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="72"
                              cy="72"
                              r={radius}
                              className="text-slate-100"
                              strokeWidth="12"
                              stroke="currentColor"
                              fill="transparent"
                            />
                            <circle
                              cx="72"
                              cy="72"
                              r={radius}
                              className="text-indigo-600 transition-all duration-1000 ease-out"
                              strokeWidth="12"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-2xl font-black text-slate-800">{percentage}%</span>
                            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wide">Done</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 min-w-[150px]">
                      <span className="h-3 w-3 rounded-full bg-indigo-600 shrink-0" />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                        <span className="font-black text-slate-800 text-sm">{stats.administrator.completedTasks} tasks</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 min-w-[150px]">
                      <span className="h-3 w-3 rounded-full bg-slate-200 shrink-0" />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                        <span className="font-black text-slate-800 text-sm">{stats.administrator.pendingTasks} tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource load distribution */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950">Workspace Utilization Breakdown</h4>
                  <p className="text-xxs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">Scale breakdown ratio</p>
                </div>
                <div className="py-6 space-y-4">
                  {/* Bar 1: Users */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Total Active Team Members</span>
                      <span>{stats.administrator.totalUsers}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stats.administrator.totalUsers / 15) * 100)}%` }} />
                    </div>
                  </div>
                  {/* Bar 2: Projects */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Project Directories Initiated</span>
                      <span>{stats.administrator.totalProjects}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.administrator.totalProjects / 10) * 100)}%` }} />
                    </div>
                  </div>
                  {/* Bar 3: Tasks Volume */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Aggregate Completed Task Ratio</span>
                      <span>{stats.administrator.completedTasks} / {stats.administrator.completedTasks + stats.administrator.pendingTasks}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-550 rounded-full" style={{ width: `${(stats.administrator.completedTasks + stats.administrator.pendingTasks) > 0 ? (stats.administrator.completedTasks / (stats.administrator.completedTasks + stats.administrator.pendingTasks)) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Project Manager' && stats?.projectManager && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Projects KPI Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Your Active Projects</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.projectManager.activeProjects}</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-750 text-[10px] font-bold rounded-lg border border-indigo-100">Managing</span>
              </div>

              {/* Progress gauge card */}
              <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="font-extrabold text-sm text-slate-900">Overall Team Delivery Index</h4>
                  <p className="text-xxs font-bold text-slate-450 uppercase tracking-wider">Assigned Task Completion Rate</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Your team is currently running at an average delivery speed of <strong className="text-indigo-600 font-bold">{stats.projectManager.teamProgress}%</strong> across all active project milestones.
                  </p>
                </div>

                {/* Progress Circle Ring */}
                <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                  {(() => {
                    const radius = 42;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (stats.projectManager.teamProgress / 100) * circumference;
                    return (
                      <>
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-slate-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-emerald-500 transition-all duration-1000 ease-out"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-black text-slate-800">{stats.projectManager.teamProgress}%</span>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Done</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center">
                      <AlertTriangle className="h-4.5 w-4.5 mr-1.5 text-amber-500" />
                      Critical Team Task Deadlines
                    </h3>
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Next 5 Targets</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {stats.projectManager.upcomingDeadlines.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-xs">
                        No critical upcoming task deadlines.
                      </div>
                    ) : (
                      stats.projectManager.upcomingDeadlines.map((item) => (
                        <div key={item.taskId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">{item.taskTitle}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{item.projectTitle}</p>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                              item.priority === 'High' ? 'bg-red-50 text-red-700' :
                              item.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                              {new Date(item.deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                  <span className="text-xxs font-semibold text-slate-400">Keep communication loops open during high-priority deadlines.</span>
                </div>
              </div>

              {/* Milestone progress visualizer */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950">Milestone Priority Load</h4>
                  <p className="text-xxs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">Deadline intensity allocation</p>
                </div>
                
                <div className="py-6 space-y-4">
                  {/* High priority metric progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-750">
                      <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-2" />High Urgency Tasks</span>
                      <span>{stats.projectManager.upcomingDeadlines.filter(x => x.priority === 'High').length}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.projectManager.upcomingDeadlines.filter(x => x.priority === 'High').length / 5) * 100}%` }} />
                    </div>
                  </div>

                  {/* Medium priority metric progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-750">
                      <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-amber-500 mr-2" />Medium Urgency Tasks</span>
                      <span>{stats.projectManager.upcomingDeadlines.filter(x => x.priority === 'Medium').length}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.projectManager.upcomingDeadlines.filter(x => x.priority === 'Medium').length / 5) * 100}%` }} />
                    </div>
                  </div>

                  {/* Low priority metric progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-750">
                      <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-slate-400 mr-2" />Normal Urgency Tasks</span>
                      <span>{stats.projectManager.upcomingDeadlines.filter(x => x.priority !== 'High' && x.priority !== 'Medium').length}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(stats.projectManager.upcomingDeadlines.filter(x => x.priority !== 'High' && x.priority !== 'Medium').length / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xxs font-bold text-slate-400 uppercase">
                  <span>Milestone Intensity</span>
                  <span className="text-indigo-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Employee' && stats?.employee && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Your Assigned Tasks</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.employee.assignedTasksCount}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Tasks Completed</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.employee.completedTasksCount}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Due Soon (3 Days)</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.employee.dueSoonCount}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Ring Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950">Personal Productivity Quotient</h4>
                  <p className="text-xxs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">Assigned Target Completion ratio</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-around py-6 gap-6">
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    {(() => {
                      const total = stats.employee.assignedTasksCount;
                      const completed = stats.employee.completedTasksCount;
                      const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
                      const radius = 45;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (ratio / 100) * circumference;
                      return (
                        <>
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r={radius}
                              className="text-slate-100"
                              strokeWidth="10"
                              stroke="currentColor"
                              fill="transparent"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r={radius}
                              className="text-indigo-600 transition-all duration-1000 ease-out"
                              strokeWidth="10"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-2xl font-black text-slate-850">{ratio}%</span>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Done</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="space-y-2.5 shrink-0 text-center sm:text-left">
                    <p className="text-xs font-semibold text-slate-700">
                      {(() => {
                        const total = stats.employee.assignedTasksCount;
                        const completed = stats.employee.completedTasksCount;
                        const ratio = total > 0 ? (completed / total) * 100 : 0;
                        if (total === 0) return "No tasks assigned yet!";
                        if (ratio >= 100) return "Outstanding! 100% Complete! 🎉";
                        if (ratio >= 50) return "Over halfway! Great momentum! ⚡";
                        return "Let's check-off some task goals! 🚀";
                      })()}
                    </p>
                    <p className="text-xxs text-slate-400 max-w-[200px]">
                      Your completion percentage is calculated relative to total assigned tasks. Keep milestones up to date!
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xxs font-bold text-slate-400 uppercase">
                  <span>Workplace Tracker</span>
                  <span className="text-indigo-600">Active Duty</span>
                </div>
              </div>

              {/* Urgency warning and action card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-950">Upcoming Task Deadlines</h4>
                  <p className="text-xxs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">High Urgency Tracker</p>
                </div>

                <div className="py-4 space-y-3.5">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xxs font-bold text-slate-450 uppercase tracking-wider">Due within 3 Days</p>
                      <p className="text-lg font-black text-rose-600 mt-0.5">
                        {stats.employee.dueSoonCount} {stats.employee.dueSoonCount === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xxs font-bold rounded-lg ${stats.employee.dueSoonCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-500'}`}>
                      {stats.employee.dueSoonCount > 0 ? 'Urgent Review' : 'Healthy Load'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Need to update a checklist item, request support from managers, or post an update comment on your deliverables? Go directly to the boards.
                  </p>
                </div>

                <button 
                  onClick={() => setActiveTab('Tasks')}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Go to Tasks Directory</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Overview Empty State */}
        {!stats && !loadingStats && (
          <div className="p-12 text-center bg-white border border-slate-150 rounded-2xl shadow-xs">
            <LayoutDashboard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-semibold">No summary data available.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-150">
        <div className="h-16 px-6 flex items-center border-b border-slate-150">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">
              ST
            </div>
            <span className="font-black text-slate-900 text-md tracking-tight">SmartTask</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            id="nav-btn-overview"
            onClick={() => setActiveTab('Overview')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
              activeTab === 'Overview' 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Overview</span>
          </button>

          <button
            id="nav-btn-projects"
            onClick={() => setActiveTab('Projects')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
              activeTab === 'Projects' 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <FolderKanban className="h-4.5 w-4.5" />
            <span>Projects</span>
          </button>

          <button
            id="nav-btn-tasks"
            onClick={() => setActiveTab('Tasks')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
              activeTab === 'Tasks' 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="h-4.5 w-4.5" />
            <span>Tasks</span>
          </button>

          {user?.role === 'Administrator' && (
            <button
              id="nav-btn-users"
              onClick={() => setActiveTab('Users')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                activeTab === 'Users' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Users</span>
            </button>
          )}

          <button
            id="nav-btn-profile"
            onClick={() => setActiveTab('Profile')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
              activeTab === 'Profile' 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <UserIcon className="h-4.5 w-4.5" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-150 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img 
              src={user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
              alt={user?.full_name} 
              className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-xxs"
              referrerPolicy="no-referrer"
            />
            <div className="leading-tight">
              <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{user?.full_name}</p>
              <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            id="desktop-logout-btn"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* MOBILE HAMBURGER BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - MOBILE DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
          >
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-150">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  ST
                </div>
                <span className="font-black text-slate-900 text-md tracking-tight">SmartTask</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <button
                onClick={() => { setActiveTab('Overview'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                  activeTab === 'Overview' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('Projects'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                  activeTab === 'Projects' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <FolderKanban className="h-4.5 w-4.5" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => { setActiveTab('Tasks'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                  activeTab === 'Tasks' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="h-4.5 w-4.5" />
                <span>Tasks</span>
              </button>

              {user?.role === 'Administrator' && (
                <button
                  onClick={() => { setActiveTab('Users'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                    activeTab === 'Users' 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Users className="h-4.5 w-4.5" />
                  <span>Users</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('Profile'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors ${
                  activeTab === 'Profile' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <UserIcon className="h-4.5 w-4.5" />
                <span>Profile</span>
              </button>
            </nav>

            <div className="p-4 border-t border-slate-150 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src={user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
                  alt={user?.full_name} 
                  className="h-9 w-9 rounded-xl object-cover border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="leading-tight">
                  <p className="text-xs font-black text-slate-800">{user?.full_name}</p>
                  <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-150 px-6 flex items-center justify-between lg:justify-end">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>

          <div className="flex items-center space-x-4">
            <button
              id="monochrome-toggle-btn"
              onClick={() => setIsMonochrome(!isMonochrome)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMonochrome
                  ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Black & White Mode"
            >
              <Contrast className="h-4 w-4" />
              <span className="hidden xs:inline">{isMonochrome ? "Classic B&W" : "Full Color"}</span>
            </button>

            <span className="hidden sm:inline-block text-slate-400 text-xxs font-black uppercase tracking-widest bg-slate-50 border border-slate-150 px-2 py-1 rounded-md">
              {user?.role} Mode
            </span>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </header>

        {/* CONTENT STAGE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsLogoutConfirmOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-sm w-full overflow-hidden relative z-10 p-6 space-y-5"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl shrink-0">
                  <LogOut className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Log Out?</h3>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    Are you sure you want to log out of your session? You will need to log back in to access the system.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  id="logout-cancel-btn"
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="logout-confirm-btn"
                  type="button"
                  onClick={confirmLogout}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
