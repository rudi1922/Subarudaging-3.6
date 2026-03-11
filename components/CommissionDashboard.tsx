import React from 'react';
import { Wallet, TrendingUp, Users, Copy, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../StoreContext';
import { User } from '../types';

interface CommissionDashboardProps {
  user: User;
}

const CommissionDashboard: React.FC<CommissionDashboardProps> = ({ user }) => {
  const { commissions, users } = useStore();
  const [copied, setCopied] = React.useState(false);

  const myCommissions = commissions.filter(c => c.referrerId === user.id);
  const totalEarnings = myCommissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingEarnings = myCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  
  const referralLink = `${window.location.origin}/?ref=${user.referralCode || user.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Penghasilan Saya</h1>
          <p className="text-gray-400 text-sm">Pantau komisi dan performa referral Anda</p>
        </div>
        <div className="bg-brand-gold/10 border border-brand-gold/20 px-4 py-2 rounded-full flex items-center gap-2">
          <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest">Status: Active Partner</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Pendapatan</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white font-mono">
              Rp {totalEarnings.toLocaleString('id-ID')}
            </h3>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 text-white/5 w-20 h-20 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Menunggu Pencairan</p>
            <h3 className="text-2xl md:text-3xl font-bold text-brand-gold font-mono">
              Rp {pendingEarnings.toLocaleString('id-ID')}
            </h3>
          </div>
          <Clock className="absolute -right-4 -bottom-4 text-brand-gold/5 w-20 h-20 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Referral</p>
            <h3 className="text-2xl md:text-3xl font-bold text-blue-400 font-mono">
              {myCommissions.length} Transaksi
            </h3>
          </div>
          <Users className="absolute -right-4 -bottom-4 text-blue-400/5 w-20 h-20 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-[#1e1e1e] p-6 md:p-8 rounded-2xl border border-brand-gold/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left w-full">
            <h3 className="text-xl font-display font-bold text-white mb-2">Bagikan & Dapatkan Komisi!</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto lg:mx-0">
              Dapatkan komisi <span className="text-brand-gold font-bold">2.5%</span> dari setiap transaksi yang dilakukan oleh orang yang Anda referensikan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
              <code className="flex-1 px-4 py-2 text-brand-gold font-mono text-xs md:text-sm truncate bg-black/20 rounded-lg">
                {referralLink}
              </code>
              <button 
                onClick={handleCopy}
                className="bg-brand-gold text-black px-4 py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 font-bold text-[10px] tracking-widest"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'TERSALIN' : 'SALIN LINK'}
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-64 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Kode Referral Anda</p>
            <div className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter mb-2">
              {user.referralCode || user.username.toUpperCase()}
            </div>
            <p className="text-[10px] text-brand-gold font-bold">GUNAKAN SAAT PENDAFTARAN</p>
          </div>
        </div>
      </div>

      {/* Recent Commissions Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="p-4 md:p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-base md:text-lg font-display font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" /> Riwayat Komisi
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20">
                <th className="p-3 md:p-4 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Waktu</th>
                <th className="p-3 md:p-4 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pelanggan</th>
                <th className="p-3 md:p-4 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Komisi</th>
                <th className="p-3 md:p-4 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {myCommissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 italic text-sm">
                    Belum ada riwayat komisi.
                  </td>
                </tr>
              ) : (
                myCommissions.map((comm) => {
                  const referredUser = Array.isArray(users) ? users.find(u => u.id === comm.referredUserId) : null;
                  const dateStr = comm.createdAt ? new Date(comm.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-';
                  const timeStr = comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
                  const initial = referredUser?.name ? referredUser.name.charAt(0) : '?';
                  
                  return (
                    <tr key={comm.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 md:p-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] md:text-sm text-white font-medium">{dateStr}</span>
                          <span className="text-[9px] text-gray-500">{timeStr}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-6 h-6 md:w-7 md:h-7 bg-brand-red/20 rounded-full flex items-center justify-center text-brand-red font-bold text-[9px] md:text-[10px] flex-shrink-0">
                            {initial}
                          </div>
                          <span className="text-[11px] md:text-sm font-medium text-white truncate max-w-[70px] md:max-w-none">{referredUser?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-right">
                        <span className="text-[11px] md:text-sm font-bold text-green-500 font-mono">
                          +Rp {comm.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-center">
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider ${
                          comm.status === 'paid' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                        }`}>
                          {comm.status === 'paid' ? 'Paid' : 'Pend'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionDashboard;
