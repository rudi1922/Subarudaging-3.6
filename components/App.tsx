import React, { useState } from 'react';
import PublicLanding from './components/PublicLanding';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Finance from './components/Finance';
import HR from './components/HR';
import Settings from './components/Settings';
import Stakeholders from './components/Stakeholders';
import Distribution from './components/Distribution';
import MarketAnalysis from './components/MarketAnalysis';
import LoginModal from './components/LoginModal';
import { User, Role } from './types';
import { StoreProvider } from './StoreContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogin = (selectedUser: User) => {
    setUser(selectedUser);
    setIsLoginOpen(false);
    
    // Set default view based on role
    if (selectedUser.role === Role.CASHIER) {
      setCurrentView('pos');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  // Render the appropriate internal component based on currentView state
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'pos': return <POS />;
      case 'finance': return <Finance />;
      case 'distribution': return <Distribution />;
      case 'market_analysis': return <MarketAnalysis />;
      case 'hr': return <HR />;
      case 'contacts': return <Stakeholders />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <>
        <PublicLanding onLoginClick={() => setIsLoginOpen(true)} />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onLogin={handleLogin} 
        />
      </>
    );
  }

  return (
    <StoreProvider>
      <AdminLayout 
        user={user} 
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={setCurrentView}
      >
        {renderView()}
      </AdminLayout>
    </StoreProvider>
  );
}

export default App;