import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Filter,
  Download
} from 'lucide-react';
import { useStore } from '../StoreContext';
import { PrivateTransaction, User, Role } from '../types';

interface DirectorPrivateProps {
  user: User;
}

const DirectorPrivate: React.FC<DirectorPrivateProps> = ({ user }) => {
  const { privateTransactions, addPrivateTransaction, deletePrivateTransaction, receivables } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'receivables'>('transactions');
  const [newTx, setNewTx] = useState<Partial<PrivateTransaction>>({
    type: 'Pengeluaran',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'Lainnya'
  });

  // Security Check: Only Director and Admin can access
  if (user.role !== Role.DIRECTOR && user.role !== Role.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <Lock size={64} className="text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white mb-2">Akses Terbatas</h2>
        <p className="text-gray-400 max-w-md">Modul ini hanya dapat diakses oleh Direktur dan Admin Kantor. Data bersifat rahasia dan pribadi.</p>
      </div>
    );
  }

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: PrivateTransaction = {
      id: `ptx-${Date.now()}`,
      date: newTx.date || '',
      type: newTx.type as PrivateTransaction['type'],
      category: newTx.category || '',
      amount: Number(newTx.amount) || 0,
      description: newTx.description || '',
      userId: user.id
    };
    addPrivateTransaction(tx);
    setIsAddModalOpen(false);
    setNewTx({
      type: 'Pengeluaran',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'Lainnya'
    });
  };

  const totalIncome = privateTransactions
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = privateTransactions
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceivables = receivables
    .filter(r => r.status !== 'Lunas')
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-red rounded-xl shadow-lg shadow-brand-red/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Keuangan Pribadi Direktur</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Lock size={14} />
              Data terenkripsi dan hanya terlihat oleh Anda
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
          >
            {showValues ? <EyeOff size={18} /> : <Eye size={18} />}
            {showValues ? 'Sembunyikan' : 'Tampilkan Nilai'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-brand-red/20"
          >
            <Plus size={18} />
            Catat Transaksi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-emerald-500" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pemasukan</p>
          <h3 className="text-2xl font-bold text-emerald-500">
            {showValues ? `Rp ${totalIncome.toLocaleString()}` : 'Rp ••••••••'}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">Pribadi</span>
            <span>Bulan ini</span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={64} className="text-brand-red" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pengeluaran</p>
          <h3 className="text-2xl font-bold text-brand-red">
            {showValues ? `Rp ${totalExpense.toLocaleString()}` : 'Rp ••••••••'}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="px-1.5 py-0.5 bg-brand-red/10 text-brand-red rounded">Pribadi</span>
            <span>Bulan ini</span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-brand-gold" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Saldo Bersih</p>
          <h3 className="text-2xl font-bold text-brand-gold">
            {showValues ? `Rp ${balance.toLocaleString()}` : 'Rp ••••••••'}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold rounded">Tersedia</span>
            <span>Update Real-time</span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-brand-red/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Plus size={64} className="text-brand-red" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Piutang Sistem</p>
          <h3 className="text-2xl font-bold text-brand-red">
            {showValues ? `Rp ${totalReceivables.toLocaleString()}` : 'Rp ••••••••'}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="px-1.5 py-0.5 bg-brand-red/10 text-brand-red rounded">Sistem</span>
            <span>Belum Lunas</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'transactions' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Transaksi Pribadi
        </button>
        <button 
          onClick={() => setActiveTab('receivables')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'receivables' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Piutang Sistem (Real-time)
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white">Riwayat Transaksi Pribadi</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/10">
                <Filter size={18} />
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/10">
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {privateTransactions.length > 0 ? [...privateTransactions].reverse().map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'Pemasukan' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-red/10 text-brand-red'}`}>
                    {tx.type === 'Pemasukan' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{tx.description}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar size={10} />
                        {new Date(tx.date).toLocaleDateString('id-ID')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-gray-400 rounded uppercase">
                        {tx.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-mono font-bold ${tx.type === 'Pemasukan' ? 'text-emerald-500' : 'text-brand-red'}`}>
                    {tx.type === 'Pemasukan' ? '+' : '-'} {showValues ? `Rp ${tx.amount.toLocaleString()}` : 'Rp ••••••••'}
                  </div>
                  <button 
                    onClick={() => deletePrivateTransaction(tx.id)}
                    className="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500">
                <Lock size={48} className="mx-auto mb-4 opacity-10" />
                <p>Belum ada catatan transaksi pribadi</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white">Daftar Piutang Sistem (Belum Lunas)</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/10">
                <Filter size={18} />
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/10">
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pelanggan</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Jatuh Tempo</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {receivables.filter(r => r.status !== 'Lunas').map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm font-mono text-brand-gold">{r.invoiceId}</td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-white">{r.customerName}</div>
                      <div className="text-[10px] text-gray-500">{r.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{new Date(r.dueDate).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 text-sm font-bold text-white">
                      {showValues ? `Rp ${r.amount.toLocaleString()}` : 'Rp ••••••••'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'Jatuh Tempo' ? 'bg-red-500/10 text-red-500' : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {receivables.filter(r => r.status !== 'Lunas').length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      Tidak ada piutang sistem yang aktif
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-lg font-bold text-white">Catat Transaksi Pribadi</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <Trash2 size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddTx} className="p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-black/30 rounded-lg border border-white/10">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'Pemasukan'})}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'Pemasukan' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  PEMASUKAN
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'Pengeluaran'})}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'Pengeluaran' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  PENGELUARAN
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Keterangan</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                  value={newTx.description || ''}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  placeholder="Contoh: Gaji Bulanan / Beli Kebutuhan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Jumlah (Rp)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Kategori</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                  value={newTx.category}
                  onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                >
                  <option value="Gaji">Gaji</option>
                  <option value="Investasi">Investasi</option>
                  <option value="Kebutuhan">Kebutuhan</option>
                  <option value="Hiburan">Hiburan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors border border-white/10"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-red hover:bg-red-600 rounded-lg text-white font-medium transition-colors shadow-lg shadow-brand-red/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorPrivate;
