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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Penghasilan Saya</h1>
          <p className="text-gray-400 text-sm">Pantau komisi dan performa referral Anda</p>
        </div>
        <div className="bg-brand-gold/10 border border-brand-gold/20 px-4 py-2 rounded-full flex items-center gap-2">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Status: Active Partner</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Pendapatan</p>
            <h3 className="text-3xl font-bold text-white font-mono">
              Rp {totalEarnings.toLocaleString('id-ID')}
            </h3>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Menunggu Pencairan</p>
            <h3 className="text-3xl font-bold text-brand-gold font-mono">
              Rp {pendingEarnings.toLocaleString('id-ID')}
            </h3>
          </div>
          <Clock className="absolute -right-4 -bottom-4 text-brand-gold/5 w-24 h-24 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Referral</p>
            <h3 className="text-3xl font-bold text-blue-400 font-mono">
              {myCommissions.length} Transaksi
            </h3>
          </div>
          <Users className="absolute -right-4 -bottom-4 text-blue-400/5 w-24 h-24 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-[#1e1e1e] p-8 rounded-2xl border border-brand-gold/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Bagikan & Dapatkan Komisi!</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Dapatkan komisi <span className="text-brand-gold font-bold">2.5%</span> dari setiap transaksi yang dilakukan oleh orang yang Anda referensikan.
            </p>
            
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
              <code className="flex-1 px-4 py-2 text-brand-gold font-mono text-sm truncate">
                {referralLink}
              </code>
              <button 
                onClick={handleCopy}
                className="bg-brand-gold text-black p-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 font-bold text-xs"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'TERSALIN' : 'SALIN LINK'}
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-64 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Kode Referral Anda</p>
            <div className="text-4xl font-serif font-black text-white tracking-tighter mb-2">
              {user.referralCode || user.username.toUpperCase()}
            </div>
            <p className="text-[10px] text-brand-gold font-bold">GUNAKAN SAAT PENDAFTARAN</p>
          </div>
        </div>
      </div>

      {/* Recent Commissions Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-green-400" /> Riwayat Komisi
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20">
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tanggal</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pelanggan</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID Transaksi</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jumlah</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {myCommissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                    Belum ada riwayat komisi. Mulai bagikan link Anda!
                  </td>
                </tr>
              ) : (
                myCommissions.map((comm) => {
                  const referredUser = Array.isArray(users) ? users.find(u => u.id === comm.referredUserId) : null;
                  const dateStr = comm.createdAt ? new Date(comm.createdAt).toLocaleDateString('id-ID') : '-';
                  const initial = referredUser?.name ? referredUser.name.charAt(0) : '?';
                  
                  return (
                    <tr key={comm.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm text-gray-300">
                        {dateStr}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-red/20 rounded-full flex items-center justify-center text-brand-red font-bold text-xs">
                            {initial}
                          </div>
                          <span className="text-sm font-medium text-white">{referredUser?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-500">
                        #{comm.transactionId ? comm.transactionId.slice(-8).toUpperCase() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-green-400">
                          +Rp {comm.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          comm.status === 'paid' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                        }`}>
                          {comm.status === 'paid' ? 'Dibayar' : 'Pending'}
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
