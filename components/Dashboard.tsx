import React from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Package, Activity, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../StoreContext';

const data = [
  { name: 'Mon', income: 4000, expense: 2400 },
  { name: 'Tue', income: 3000, expense: 1398 },
  { name: 'Wed', income: 2000, expense: 9800 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];

const Dashboard: React.FC = () => {
  const { products, receivables, expenses, transactions } = useStore();
  
  const safeReceivables = receivables || [];
  const safeExpenses = expenses || [];
  const safeTransactions = transactions || [];
  const safeProducts = products || [];

  const totalReceivables = safeReceivables.filter(r => r && r.status !== 'Lunas').reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRevenue = safeTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Section matching screenshot */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Overview Operasional & Aktivitas</p>
        </div>
        <div className="px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 font-mono text-xs font-bold tracking-wider">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* KPI Cards - Solid Colors matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pendapatan (Green) */}
        <div className="bg-[#10B981] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white font-mono mb-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h3>
            <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest">TOTAL PENDAPATAN</p>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-green-700/30 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>

        {/* Card 2: Total Pengeluaran (Red) */}
        <div className="bg-[#EF4444] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white font-mono mb-1">
              Rp {totalExpenses.toLocaleString('id-ID')}
            </h3>
            <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">TOTAL PENGELUARAN</p>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 text-red-800/30 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>

        {/* Card 3: Total Piutang (Orange) */}
        <div className="bg-[#F97316] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white font-mono mb-1">
              Rp {totalReceivables.toLocaleString('id-ID')}
            </h3>
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">TOTAL PIUTANG</p>
          </div>
          <AlertTriangle className="absolute -right-4 -bottom-4 text-orange-800/30 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>

        {/* Card 4: Items (Blue) */}
        <div className="bg-[#3B82F6] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white font-mono mb-1">
              {safeProducts.length} Item
            </h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">TOTAL PRODUK</p>
          </div>
          <Package className="absolute -right-4 -bottom-4 text-blue-800/30 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B0000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" stroke="#8B0000" fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 overflow-hidden flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-400"/> Aktivitas Terbaru
            </h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {safeTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Belum ada aktivitas.</p>
                ) : (
                    safeTransactions.slice(0, 10).map((t, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                        <div className="mt-1 bg-white/10 p-1.5 rounded-full">
                            <ShoppingCart size={14} className="text-gray-300" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-200 font-medium">Transaksi: {t.customerName || 'Pelanggan Umum'}</p>
                            <p className="text-xs text-gray-500">Total: Rp {(t.total || 0).toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-brand-gold mt-1">{t.date ? new Date(t.date).toLocaleString('id-ID') : '-'}</p>
                        </div>
                    </div>
                    ))
                )}
            </div>
            </div>
        </div>
      </div>

      {/* Profit & Loss Table */}
      <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Laporan Rugi Laba (Global & Per Gerai)
          </h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Update: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nama Gerai / Outlet</th>
                <th className="px-6 py-4 font-medium text-right">Pendapatan</th>
                <th className="px-6 py-4 font-medium text-right">Pengeluaran</th>
                <th className="px-6 py-4 font-medium text-right">HPP (Est.)</th>
                <th className="px-6 py-4 font-medium text-right">Laba Bersih</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Global Row */}
              <tr className="bg-brand-red/5 font-bold">
                <td className="px-6 py-4 text-white">REKAPITULASI GLOBAL</td>
                <td className="px-6 py-4 text-right text-emerald-400 font-mono">Rp {totalRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-red-400 font-mono">Rp {totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-gray-400 font-mono">Rp {(totalRevenue * 0.7).toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-brand-gold font-mono">Rp {(totalRevenue - totalExpenses - (totalRevenue * 0.7)).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-[10px] rounded uppercase">Global</span>
                </td>
              </tr>
              {/* Per Outlet Rows */}
              {useStore().outlets
                .filter(outlet => 
                  outlet.name.toLowerCase().includes('pasar tamin') || 
                  outlet.name.toLowerCase().includes('pasar wayhalim') || 
                  outlet.name.toLowerCase().includes('pasar tugu')
                )
                .map(outlet => {
                  const outletTransactions = safeTransactions.filter(t => t.outletId === outlet.id);
                  const outletExpenses = safeExpenses.filter(e => e.outletId === outlet.id);
                  const rev = outletTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
                  const exp = outletExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                  const hpp = rev * 0.7; // Estimated COGS at 70%
                  const profit = rev - exp - hpp;
                  
                  return (
                    <tr key={outlet.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-300">{outlet.name}</td>
                      <td className="px-6 py-4 text-right text-gray-400 font-mono">Rp {rev.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-gray-400 font-mono">Rp {exp.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono">Rp {hpp.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-right font-mono ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        Rp {profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`w-2 h-2 rounded-full mx-auto ${profit >= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;