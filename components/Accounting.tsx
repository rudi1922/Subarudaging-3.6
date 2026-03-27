import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Filter,
  Package,
  Building,
  Truck,
  Monitor,
  MoreVertical
} from 'lucide-react';
import { useStore } from '../StoreContext';
import { Asset, User } from '../types';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface AccountingProps {
  user: User;
}

const Accounting: React.FC<AccountingProps> = () => {
  const { assets, addAsset, deleteAsset, products } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    category: 'Kendaraan',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    depreciationRate: 10
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const asset: Asset = {
      id: `asset-${Date.now()}`,
      name: newAsset.name || '',
      category: newAsset.category as Asset['category'],
      purchaseDate: newAsset.purchaseDate || '',
      purchasePrice: Number(newAsset.purchasePrice) || 0,
      currentValue: Number(newAsset.purchasePrice) || 0,
      depreciationRate: Number(newAsset.depreciationRate) || 0,
      notes: newAsset.notes,
      outletId: newAsset.outletId
    };
    addAsset(asset);
    setIsAddModalOpen(false);
    setNewAsset({
      category: 'Kendaraan',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      depreciationRate: 10
    });
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * (p.buyPrice || 0)), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Kendaraan': return <Truck size={18} />;
      case 'Peralatan': return <Monitor size={18} />;
      case 'Properti': return <Building size={18} />;
      default: return <Package size={18} />;
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(20);
      doc.text('Laporan Aset & Aktiva - Subaru Daging Sapi', 14, 22);
      
      // Add Summary
      doc.setFontSize(12);
      doc.text(`Total Nilai Aset: Rp ${totalAssetValue.toLocaleString()}`, 14, 35);
      doc.text(`Total Nilai Inventaris: Rp ${totalInventoryValue.toLocaleString()}`, 14, 42);
      doc.text(`Total Aktiva: Rp ${(totalAssetValue + totalInventoryValue).toLocaleString()}`, 14, 49);
      doc.text(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}`, 14, 56);
      
      // Add Table
      const tableColumn = ["Nama Aset", "Kategori", "Tgl Perolehan", "Harga Beli", "Nilai Saat Ini"];
      const tableRows = filteredAssets.map(asset => [
        asset.name,
        asset.category,
        new Date(asset.purchaseDate).toLocaleDateString('id-ID'),
        `Rp ${asset.purchasePrice.toLocaleString()}`,
        `Rp ${asset.currentValue.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] }, // Brand Red
        styles: { fontSize: 9 }
      });
      
      doc.save(`Laporan_Aset_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback to window.print if jsPDF fails
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-brand-red" />
            Akuntansi & Aktiva
          </h2>
          <p className="text-gray-400 text-sm">Manajemen aset tetap dan inventaris perusahaan</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
          >
            <Download size={18} />
            Ekspor Laporan (PDF)
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-brand-red/20"
          >
            <Plus size={18} />
            Tambah Aset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <Building size={24} />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Nilai Aset</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Rp {totalAssetValue.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Aktiva tetap terdaftar</p>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Package size={24} />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Nilai Inventaris</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Rp {totalInventoryValue.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Berdasarkan harga beli stok saat ini</p>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Aktiva</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Rp {(totalAssetValue + totalInventoryValue).toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Gabungan aset & stok</p>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-white">Daftar Aset Tetap</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Cari aset..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-red w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/10">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nama Aset</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Tgl Perolehan</th>
                <th className="px-6 py-4 font-medium text-right">Harga Beli</th>
                <th className="px-6 py-4 font-medium text-right">Nilai Saat Ini</th>
                <th className="px-6 py-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-brand-red">
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{asset.name}</div>
                        <div className="text-xs text-gray-500">{asset.notes || 'Tanpa catatan'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 text-gray-300 text-[10px] rounded-full uppercase font-bold">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(asset.purchaseDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-mono">
                    Rp {asset.purchasePrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gold text-right font-mono">
                    Rp {asset.currentValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteAsset(asset.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Building size={48} className="opacity-20" />
                      <p>Belum ada aset terdaftar</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-lg font-bold text-white">Tambah Aset Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <Trash2 size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 uppercase mb-1">Nama Aset</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newAsset.name || ''}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                    placeholder="Contoh: Mobil Pick-up L300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Kategori</label>
                  <select 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value as Asset['category']})}
                  >
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Peralatan">Peralatan</option>
                    <option value="Properti">Properti</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Tgl Perolehan</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newAsset.purchaseDate}
                    onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Harga Beli (Rp)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({...newAsset, purchasePrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Penyusutan (% / Thn)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                    value={newAsset.depreciationRate}
                    onChange={(e) => setNewAsset({...newAsset, depreciationRate: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 uppercase mb-1">Catatan</label>
                  <textarea 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none h-20"
                    value={newAsset.notes || ''}
                    onChange={(e) => setNewAsset({...newAsset, notes: e.target.value})}
                    placeholder="Kondisi, lokasi, dll..."
                  />
                </div>
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
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
