import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';

function MainApp() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-semibold text-slate-500">Securing environment & session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (view === 'landing') {
      return (
        <LandingPage 
          onNavigateToLogin={() => setView('login')} 
          onNavigateToSignup={() => setView('signup')} 
        />
      );
    }
    if (view === 'login') {
      return (
        <Login 
          onBackToLanding={() => setView('landing')} 
          onNavigateToSignup={() => setView('signup')} 
        />
      );
    }
    return (
      <Signup 
        onBackToLogin={() => setView('login')} 
        onBackToLanding={() => setView('landing')} 
      />
    );
  }

  return <DashboardLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

