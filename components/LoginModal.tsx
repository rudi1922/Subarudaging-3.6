import React, { useState } from 'react';
import { X as XIcon, User as UserIcon, Lock, Loader2, CheckCircle } from 'lucide-react';
import { User, Role } from '../types';
import { authenticateUser, createUser } from '../services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(Role.CASHIER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const referrerCode = localStorage.getItem('referral_code') || undefined;
        const newUser = await createUser({ 
            username, 
            password, 
            name, 
            role, 
            isApproved: false,
            referrerCode
        });
        
        if (newUser) {
          setSuccess('Pendaftaran berhasil! Silakan tunggu persetujuan dari Admin sebelum login.');
          setIsRegistering(false);
          setUsername('');
          setPassword('');
          setName('');
          localStorage.removeItem('referral_code'); // Clear after use
        } else {
          setError('Gagal mendaftar. Username mungkin sudah digunakan atau server bermasalah.');
        }
      } else {
        const user = await authenticateUser(username, password);

        if (user) {
          onLogin(user);
          onClose();
        } else {
          setError('Username atau Password salah.');
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message === 'Menunggu Persetujuan Admin') {
          setError(err.message);
      } else {
          setError('Terjadi kesalahan sistem. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl border border-black/5 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10">
          <XIcon size={24} />
        </button>
        
        <div className="p-4 md:p-8 text-center border-b border-black/5 bg-gray-50">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 border border-brand-red/20 shadow-lg shadow-brand-red/10">
             <Lock size={20} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-lg md:text-2xl font-serif font-bold text-black tracking-wide">
            {isRegistering ? 'Daftar Akun Baru' : 'System Access'}
          </h2>
          <p className="text-gray-500 text-[9px] md:text-xs mt-1 md:mt-2 uppercase tracking-widest">
            {isRegistering ? 'Silakan lengkapi data Anda' : 'Secure ERP Login'}
          </p>
        </div>

        <div className="p-5 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-300 focus:border-brand-red/50 focus:bg-white outline-none transition-all text-sm"
                    placeholder="Nama Lengkap"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Username</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-300 focus:border-brand-red/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-300 focus:border-brand-red/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl py-3 px-4 text-black focus:border-brand-red/50 focus:bg-white outline-none transition-all text-sm"
                  disabled={isLoading}
                >
                  <option value={Role.CASHIER}>Cashier</option>
                  <option value={Role.SALES}>Sales Marketing</option>
                  <option value={Role.DEBT_COLLECTOR}>Debt Collector</option>
                  <option value={Role.ADMIN}>Admin</option>
                  <option value={Role.MANAGER}>Manager</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                <XIcon size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                <p className="text-emerald-600 text-xs">{success}</p>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-red text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand-red/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isLoading ? 'Processing...' : (isRegistering ? 'DAFTAR SEKARANG' : 'LOGIN TO DASHBOARD')}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-brand-red hover:text-black transition-colors underline underline-offset-4"
              >
                {isRegistering ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Daftar di sini'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-4 bg-gray-50 text-center border-t border-black/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Lock size={10} /> End-to-End Encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;