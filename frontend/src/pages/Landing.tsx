import React, { useState } from 'react';
import { 
  FolderKanban, ArrowRight, ShieldCheck, Zap, 
  Sparkles, CheckSquare, Users, BarChart3, Star, 
  ChevronRight, ArrowUpRight, HelpCircle, Layout, Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export default function LandingPage({ onNavigateToLogin, onNavigateToSignup }: LandingPageProps) {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'board' | 'gantt' | 'roles'>('board');
  
  // Simulated Interactive demo state
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Redesign Landing Page UI', status: 'Completed', priority: 'High', assignee: 'Alex Rivera' },
    { id: 2, title: 'Integrate Live API Services', status: 'In Progress', priority: 'High', assignee: 'Sarah Chen' },
    { id: 3, title: 'Conduct User Acceptance Testing', status: 'To Do', priority: 'Medium', assignee: 'Michael J.' },
  ]);

  const toggleDemoTask = (id: number) => {
    setDemoTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Completed' ? 'To Do' : t.status === 'To Do' ? 'In Progress' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const features = [
    {
      icon: Zap,
      title: "Agile Task Delivery",
      description: "Manage milestones, assign task states dynamically, and track blockers with lightning-fast reactive interfaces."
    },
    {
      icon: Users,
      title: "Granular Role Privileges",
      description: "Separate permissions with strict Admin, Project Manager, and Employee tiers. Safeguard core project configurations."
    },
    {
      icon: BarChart3,
      title: "Resource & Progress Audits",
      description: "Unlock actionable overview metrics, completion rates, and historical logs automatically synchronized in real-time."
    }
  ];

  const stats = [
    { value: "99.8%", label: "Project Success Rate" },
    { value: "45%", label: "Boost in Team Efficiency" },
    { value: "10k+", label: "Tasks Completed Weekly" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-indigo-150 selection:text-indigo-900 overflow-x-hidden">
      
      {/* 1. HERO WRAPPER WITH FULL BACKGROUND IMAGE */}
      <div 
        className="relative min-h-[90vh] flex flex-col justify-between bg-cover bg-center bg-no-repeat text-white"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.90), rgba(30, 41, 59, 0.95)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')` 
        }}
      >
        {/* Subtle glowing elements inside background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP HEADER NAVIGATION */}
        <header className="w-full bg-slate-900/40 backdrop-blur-md border-b border-white/10 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Logo Brand */}
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
                <FolderKanban className="h-5.5 w-5.5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">SmartPM <span className="text-indigo-400">System</span></span>
            </div>

            {/* Center Links (Anchor links/nav items) */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#interactive-preview" className="hover:text-white transition-colors">Interactive Demo</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* CTA actions */}
            <div className="flex items-center space-x-4">
              <button
                id="landing-signin-nav-btn"
                onClick={onNavigateToLogin}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2 cursor-pointer"
              >
                Sign In
              </button>
              <button
                id="landing-cta-nav-btn"
                onClick={onNavigateToSignup}
                className="flex items-center px-4.5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION CONTENT */}
        <section className="relative flex-1 flex items-center pt-12 pb-20 md:py-24 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-3xl mx-auto space-y-6">

              {/* Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] md:leading-none"
              >
                Streamline Projects.<br />
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Empower Teams.</span><br />
                Deliver Excellence.
              </motion.h1>

              {/* Sub-headline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto"
              >
                SmartPM combines clean agile boards, custom role privileges, real-time workload synchronization, and responsive progress auditing into one robust full-stack solution.
              </motion.p>

              {/* Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <button
                  id="hero-get-started-btn"
                  onClick={onNavigateToSignup}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center space-x-2 text-base hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="#interactive-preview"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-xs text-white font-bold border border-white/20 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center text-sm"
                >
                  Interactive Sandbox Demo
                </a>
              </motion.div>

              {/* Stats list */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-8 border-t border-white/10"
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-2xl sm:text-3xl font-black text-indigo-400">{stat.value}</p>
                    <p className="text-xxs sm:text-xs font-semibold text-slate-450 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>
      </div>

      {/* 3. INTERACTIVE PREVIEW SECTION */}
      <section id="interactive-preview" className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Experience It Live</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Platform Simulator</h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Test out our task state cycle simulator below. Click on any task card's status pill to cycle its stage.
            </p>
          </div>

          {/* Interactive Container */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-4 sm:p-8 max-w-4xl mx-auto shadow-2xs">
            {/* Simulation Tab Selection */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <button 
                onClick={() => setActiveInteractiveTab('board')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  activeInteractiveTab === 'board' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Board State Simulator
              </button>
              <button 
                onClick={() => setActiveInteractiveTab('gantt')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  activeInteractiveTab === 'gantt' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Milepost Timeline
              </button>
            </div>

            {/* Simulation Body */}
            {activeInteractiveTab === 'board' ? (
              <div className="space-y-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-150 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Task Name & Assignee</span>
                  <div className="flex space-x-12">
                    <span className="hidden sm:block">Priority</span>
                    <span>Status (Click to Cycle)</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {demoTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-indigo-200 shadow-2xs transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2 rounded-xl ${
                          task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <CheckSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold text-slate-900 transition-all ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-xxs font-medium text-slate-450 mt-0.5">Assigned to: {task.assignee}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 sm:space-x-12">
                        <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-500">
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${task.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                          {task.priority}
                        </span>

                        <button 
                          onClick={() => toggleDemoTask(task.id)}
                          className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wider border cursor-pointer select-none transition-all hover:scale-[1.03] active:scale-[0.97] ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : task.status === 'In Progress'
                              ? 'bg-amber-55/70 border-amber-200 text-amber-700'
                              : 'bg-slate-100 border-slate-200 text-slate-650'
                          }`}
                        >
                          {task.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xxs font-semibold text-slate-400 mt-4 italic">
                  💡 Clicking on the status pills updates the underlying state array instantly.
                </p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900">Project Milestone Roadmap</span>
                  <span className="text-xxs font-bold text-slate-450 bg-indigo-55/50 border border-indigo-100 px-2 py-0.5 rounded-md text-indigo-700">Q3 Schedule</span>
                </div>

                {/* Simulated Gantt Road */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>1. UI/UX Prototype Layout</span>
                      <span className="text-emerald-600">100% Done</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>2. Core API Integrations & Auth</span>
                      <span className="text-amber-600">80% Progress</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[80%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>3. Final Release Compliance & QA</span>
                      <span className="text-slate-400">0% Pending</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-200 rounded-full w-0" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. VALUE PILLARS & FEATURES */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Built For Delivery</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Features Engineered for Excellence</h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              SmartPM brings clarity to chaotic workflows. No bloatware or complicated syntax — just optimized team mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-3xl border border-slate-150 shadow-2xs hover:shadow-xs hover:border-indigo-150 transition-all group flex flex-col space-y-4"
                >
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit transition-all group-hover:bg-indigo-600 group-hover:text-white">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-lg text-slate-900">{feat.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{feat.description}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIAL GRID */}
      <section id="testimonials" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Client Reviews</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Loved by Product Teams</h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              See how our streamlined architecture changes the collaborative game for modern builders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-150 space-y-4 relative">
              <div className="flex space-x-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "SmartPM transformed our development workflow overnight. Having explicit Employee and Manager privilege tiers ensures that core architectural plans are never overwritten."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" 
                  alt="Reviewer" 
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">Marcus Thorne</p>
                  <p className="text-xxs font-semibold text-slate-450 uppercase">VP of Engineering, Apex Systems</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-150 space-y-4 relative">
              <div className="flex space-x-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "Clean aesthetics, fast load times, and simple local file persistence with cloud scaling. It is extremely rare to find project software that feels this fluid to navigate."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" 
                  alt="Reviewer" 
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">Elena Rostova</p>
                  <p className="text-xxs font-semibold text-slate-450 uppercase">Lead Agile Coach, CraftLab</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-150">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Questions & Answers</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-150">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center">
                <HelpCircle className="h-4.5 w-4.5 mr-2 text-indigo-600 shrink-0" />
                What role levels exist in the workspace?
              </h4>
              <p className="text-sm text-slate-500 mt-2 pl-6.5 leading-relaxed">
                SmartPM supports three role-based privilege levels: Administrators (full user management and deletion privileges), Project Managers (creating and modifying tasks or milestones), and Employees (completing task states and editing profiles).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-150">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center">
                <HelpCircle className="h-4.5 w-4.5 mr-2 text-indigo-600 shrink-0" />
                Can I test the platform with dummy accounts?
              </h4>
              <p className="text-sm text-slate-500 mt-2 pl-6.5 leading-relaxed">
                Yes! We seed standard testing accounts upon request in the login screen so you can immediately see data profiles without complex integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION & FOOTER */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-6 mb-16">
            <h3 className="text-3xl font-black text-white tracking-tight">Ready to boost your delivery?</h3>
            <p className="text-sm text-slate-400">
              Launch your secure, interactive project environment right now. Zero card details required.
            </p>
            <button
              id="footer-launch-workspace-btn"
              onClick={onNavigateToLogin}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-lg hover:bg-indigo-750 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row items-center justify-between text-xs font-semibold">
            <div className="flex items-center space-x-2.5 mb-4 md:mb-0">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <FolderKanban className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-white">SmartPM System</span>
            </div>
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} SmartPM System Inc. All rights reserved. Built to satisfy professional agile criteria.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
