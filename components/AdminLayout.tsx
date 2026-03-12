import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Calculator, 
  Store, 
  Users, 
  LogOut, 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  Contact2,
  X as XIcon,
  Briefcase,
  FolderOpen,
  ArrowUp,
  Wallet,
  Truck // Tambahan icon untuk Armada
} from 'lucide-react';
import { User, Role } from '../types';
import { useStore } from '../StoreContext';

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  user, 
  onLogout, 
  currentView, 
  onNavigate, 
  children 
}) => {
  // Logic: On mobile/tablet (<1024px), sidebar starts closed. On Desktop, starts open.
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const { searchQuery, setSearchQuery, notifications, addSystemLog, updateUser } = useStore();

  const handleUpdateProfile = () => {
      updateUser({ ...user, avatar: avatarUrl });
      setIsProfileModalOpen(false);
      alert('Profile updated!');
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Scroll for Back to Top
  useEffect(() => {
    const handleScroll = () => {
        if (mainRef.current) {
            setShowScrollTop(mainRef.current.scrollTop > 300);
        }
    };
    const mainElement = mainRef.current;
    if (mainElement) {
        mainElement.addEventListener('scroll', handleScroll);
    }
    return () => {
        if (mainElement) {
            mainElement.removeEventListener('scroll', handleScroll);
        }
    };
  }, []);

  const scrollToTop = () => {
    if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] },
    { id: 'archive', label: 'Arsip Digital', icon: FolderOpen, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] }, 
    { id: 'inventory', label: 'Gudang & Stok', icon: Package, roles: [Role.ADMIN] },
    { id: 'pos', label: 'Kasir (POS)', icon: Store, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN, Role.CASHIER, Role.RPH_ADMIN] },
    { id: 'vehicles', label: 'Armada Kendaraan', icon: Truck, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] }, // MENU BARU DI SINI
    { id: 'finance', label: 'Keuangan', icon: Calculator, roles: [Role.ADMIN] },
    { id: 'field_ops', label: 'Lapangan (Sales & DC)', icon: Briefcase, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN, Role.SALES, Role.DEBT_COLLECTOR] }, 
    { id: 'contacts', label: 'Pelanggan & Rekanan', icon: Contact2, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] },
    { id: 'hr', label: 'Karyawan & Absensi', icon: Users, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] },
    { id: 'commissions', label: 'Penghasilan Saya', icon: Wallet, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN, Role.SALES, Role.CUSTOMER] },
    { id: 'settings', label: 'Pengaturan', icon: Settings, roles: [Role.DIRECTOR, Role.MANAGER, Role.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));
  const myNotifications = notifications.filter(n => n.targetRoles.includes(user.role));
  const unreadCount = myNotifications.filter(n => !n.read).length;
  const LOGO_URL = "IMG-20260120-WA0002.jpg"; 

  const handleNavigate = (id: string) => {
      onNavigate(id);
      
      // LOG ACTIVITY
      addSystemLog({
          id: `log-${new Date().getTime()}`,
          userId: user.id,
          userName: user.name,
          role: user.role,
          action: 'NAVIGATION',
          details: `Membuka Menu ${menuItems.find(i => i.id === id)?.label}`,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.xxx',
          location: '-',
          device: navigator.userAgent
      });

      // Close sidebar on mobile after clicking
      if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
      }
  };

  return (
    <div className="flex h-[100dvh] bg-[#1a1a1a] overflow-hidden font-sans text-gray-100 relative text-sm">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 bg-[#121212] border-r border-white/5 transition-transform duration-300 ease-in-out flex flex-col w-64 lg:w-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div className="h-24 lg:h-32 flex items-center justify-center border-b border-white/5 overflow-hidden py-4 px-2 relative">
          {/* Close button for mobile inside sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <XIcon size={20} />
          </button>

          {isSidebarOpen ? (
             <div className="flex flex-col items-center w-full">
                <div className="w-16 h-16 lg:w-24 lg:h-24 relative flex items-center justify-center bg-white/5 rounded-full p-2 mb-2 shadow-lg shadow-brand-red/10 border border-white/5">
                    <img 
                      src={LOGO_URL} 
                      alt="Subaru Logo" 
                      className="w-full h-full object-contain logo-3d rounded-full"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>
                <div className="text-center leading-tight">
                    <span className="font-serif text-base lg:text-lg font-bold tracking-wider text-white block">SUBARU</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-red font-bold">Daging Sapi</span>
                </div>
             </div>
          ) : (
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center shadow-lg shadow-brand-red/30">
                <span className="font-serif text-xl font-bold text-white">S</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 lg:py-6 space-y-1 lg:space-y-2 px-3 overflow-y-auto scrollbar-hide">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className={`flex items-center gap-4 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a1a] h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#121212] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 relative z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white focus:outline-none">
                <Menu size={24} />
            </button>
            
            {/* Mobile Title if Search is hidden */}
            <span className="md:hidden font-serif font-bold text-white text-lg">SUBARU</span>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari (Global Search)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#252525] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-red"
            />
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button 
                className="md:hidden text-gray-400 hover:text-white"
                onClick={() => {
                    const searchInput = document.querySelector('input[placeholder*="Global Search"]') as HTMLInputElement;
                    if (searchInput) {
                        searchInput.focus();
                    }
                }}
            >
               <Search size={20} />
            </button>

            <div className="relative">
                <button 
                    className={`relative p-2 hover:bg-white/5 rounded-full transition-colors ${isNotifOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-red rounded-full border border-black animate-pulse"></span>}
                </button>

                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-72 md:w-80 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="p-3 border-b border-white/10 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white">Notifikasi</h4>
                            <span className="text-xs text-gray-500">{unreadCount} baru</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {myNotifications.length > 0 ? myNotifications.map(notif => (
                                <div key={notif.id} className="p-3 border-b border-white/5 bg-white/[0.03]">
                                    <p className="text-xs text-white">{notif.message}</p>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-xs text-gray-500">Kosong</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {user.role !== Role.CUSTOMER && (
              <div 
                  className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-white/10 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                  onClick={() => {
                      setAvatarUrl(user.avatar || '');
                      setIsProfileModalOpen(true);
                  }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-brand-gold">{user.role}</p>
                </div>
                <img src={user.avatar || "https://i.pravatar.cc/150"} alt="Profile" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/10 object-cover" />
              </div>
            )}
          </div>
        </header>

        {/* View Content */}
        <main ref={mainRef} className={`flex-1 overflow-x-hidden ${currentView === 'pos' ? 'overflow-y-auto lg:overflow-hidden p-2 lg:p-4' : 'overflow-y-auto p-4 lg:p-6'} relative`}>
          {children}
          {showScrollTop && (
            <button 
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 bg-brand-red text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-50 animate-bounce"
            >
                <ArrowUp size={24} />
            </button>
          )}
        </main>

        {/* Profile Modal */}
        {isProfileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#1e1e1e] w-full max-w-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                        <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                        <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-center mb-4">
                            <img src={avatarUrl || "https://i.pravatar.cc/150"} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-brand-red" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Avatar URL</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <button 
                            onClick={handleUpdateProfile}
                            className="w-full py-2 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
