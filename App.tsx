import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import PublicLanding from './components/PublicLanding';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Finance from './components/Finance';
import HR from './components/HR';
import Settings from './components/Settings';
import Stakeholders from './components/Stakeholders';
import HistoryLog from './components/HistoryLog'; 
import FieldOps from './components/FieldOps'; 
import Archive from './components/Archive'; 
import CommissionDashboard from './components/CommissionDashboard';
import Distribution from './components/Distribution';
import MarketAnalysis from './components/MarketAnalysis';
import LoginModal from './components/LoginModal';
import WelcomeModal from './components/WelcomeModal';
import AIChatbot from './components/AIChatbot';
import VehicleManager from './components/VehicleManager';
import { User, Role, SystemLog } from './types';
import { StoreProvider, useStore } from './StoreContext';
import { verifySession, logoutUser } from './services/auth';

import ErrorBoundary from './components/ErrorBoundary';

// Inner component to access Context
const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addSystemLog, customerMode, setCustomerMode } = useStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for referral or special link
    const mode = searchParams.get('mode');
    const ref = searchParams.get('ref');
    
    if (ref) {
        localStorage.setItem('referral_code', ref);
        console.warn('Referral code captured:', ref);
    }

    if (mode === 'customer' || !localStorage.getItem('auth_token')) {
        setIsWelcomeOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await verifySession();
        if (sessionUser) {
          setUser(sessionUser);
          // Restore view based on role if needed, or default to dashboard
          if (sessionUser.role === Role.CASHIER) {
              setCurrentView('pos');
          } else if (sessionUser.role === Role.SALES || sessionUser.role === Role.DEBT_COLLECTOR) {
              setCurrentView('field_ops');
          }
        } else {
            // Invalid session or no session
            console.warn('Session invalid, opening welcome modal');
            localStorage.removeItem('auth_token');
            setIsWelcomeOpen(true);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('auth_token');
        setIsWelcomeOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
        console.warn('Session check timed out');
        setIsLoading(false);
    }, 3000); // 3 seconds max loading time

    checkSession().then(() => clearTimeout(timeoutId));
    
    // Handle app re-activation (focus) to prevent hangs or stale state
    const handleFocus = () => {
      // Optionally re-verify session or sync state
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogin = (selectedUser: User) => {
    setUser(selectedUser);
    setIsLoginOpen(false);
    
    // Set default view based on role
    if (selectedUser.role === Role.CASHIER) {
      setCurrentView('pos');
    } else if (selectedUser.role === Role.SALES || selectedUser.role === Role.DEBT_COLLECTOR) {
      setCurrentView('field_ops');
    } else if (selectedUser.role === Role.ADMIN || selectedUser.role === Role.MANAGER || selectedUser.role === Role.DIRECTOR) {
      setCurrentView('dashboard'); // Will be intercepted by renderView to show AdminDashboard
    } else {
      setCurrentView('dashboard');
    }

    // --- TRACKING LOGIN ACTIVITY ---
    const recordLogin = (location: string) => {
        const log: SystemLog = {
            id: `log-${Date.now()}`,
            userId: selectedUser.id,
            userName: selectedUser.name,
            role: selectedUser.role,
            action: 'LOGIN',
            details: 'Login Berhasil',
            timestamp: new Date().toISOString(),
            ip: '192.168.1.xxx', // Mock IP
            location: location,
            device: navigator.userAgent
        };
        addSystemLog(log);
    };

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                recordLogin(`${pos.coords.latitude}, ${pos.coords.longitude}`);
            },
            () => {
                recordLogin('Location Denied/Unavailable');
            }
        );
    } else {
        recordLogin('Geolocation Not Supported');
    }
  };

  const handleLogout = () => {
    if (user) {
        addSystemLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            role: user.role,
            action: 'LOGOUT',
            details: 'Logout Sistem',
            timestamp: new Date().toISOString(),
            ip: '192.168.1.xxx',
            location: '-',
            device: navigator.userAgent
        });
    }
    logoutUser();
    setUser(null);
    setCurrentView('dashboard');
  };

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#1a1a1a] text-white">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-bold">Memuat Aplikasi...</p>
            <p className="text-xs text-gray-500 mt-2">Versi 1.1.0 (Referral System Active)</p>
        </div>
      );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'archive': return <Archive user={user!} />;
      case 'history': return <HistoryLog user={user!} />;
      case 'inventory': 
        if (user?.role === Role.ADMIN) return <Inventory user={user!} />;
        return <Dashboard />;
      case 'pos': 
        if (user?.role === Role.CASHIER || user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.DIRECTOR || user?.role === Role.RPH_ADMIN) {
            return <POS user={user!} />;
        }
        return <Dashboard />;
      case 'finance': 
        if (user?.role === Role.ADMIN) return <Finance user={user!} />;
        return <Dashboard />;
      case 'hr': return <HR user={user!} />;
      case 'contacts': return <Stakeholders user={user!} />;
      case 'field_ops': return <FieldOps user={user!} />; 
      case 'distribution': return <Distribution />;
      case 'market_analysis': return <MarketAnalysis />;
      case 'commissions': return <CommissionDashboard user={user!} />;
      case 'settings': return <Settings user={user!} />;
      default: return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <>
        <PublicLanding 
          onLoginClick={() => setIsLoginOpen(true)} 
          onPelangganClick={() => setIsWelcomeOpen(true)}
        />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onLogin={handleLogin} 
        />
        <WelcomeModal 
          isOpen={isWelcomeOpen} 
          onSelect={(role) => {
            if (role === 'customer') {
              setCustomerMode(true);
              setIsWelcomeOpen(false);
            } else {
              setCustomerMode(false);
              setIsWelcomeOpen(false);
              setIsLoginOpen(true);
            }
          }} 
        />
        {customerMode && <AIChatbot />}
      </>
    );
  }

  return (
    <AdminLayout 
      user={user} 
      onLogout={handleLogout}
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderView()}
    </AdminLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;
