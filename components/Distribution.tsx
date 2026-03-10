import React, { useState } from 'react';
import { Truck, MapPin, User, Plus, CheckCircle, FileText, Printer, Camera } from 'lucide-react';
import { useStore } from '../StoreContext';
import { Delivery, Vehicle } from '../types';
import { PrinterService } from '../utils/printer';

const Distribution: React.FC = () => {
  const { deliveries, vehicles, employees, transactions, customers, addDelivery, updateDelivery, addVehicle, printerConfig } = useStore();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'vehicles' | 'reports'>('deliveries');
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null); // Delivery ID

  // New Delivery Form State
  const [newDelivery, setNewDelivery] = useState<Partial<Delivery>>({
      status: 'Persiapan'
  });

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
      status: 'Tersedia',
      type: 'Pickup'
  });

  // Complete Delivery Form State
  const [completionData, setCompletionData] = useState({ notes: '', proofImage: '' });

  const handleAddDelivery = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDelivery.transactionId || !newDelivery.driverId || !newDelivery.vehicleId) return;

      const transaction = transactions.find(t => t.id === newDelivery.transactionId);
      
      addDelivery({
          id: `DEL-${Date.now()}`,
          transactionId: newDelivery.transactionId,
          customerName: transaction?.customerName || 'Unknown',
          address: newDelivery.address || 'Alamat tidak tersedia',
          status: 'Persiapan',
          driverId: newDelivery.driverId,
          vehicleId: newDelivery.vehicleId,
          startTime: new Date().toISOString(),
          notes: newDelivery.notes
      });
      setShowNewDeliveryModal(false);
      setNewDelivery({ status: 'Persiapan' });
  };

  const handleAddVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newVehicle.plateNumber) return;

      addVehicle({
          id: `VEH-${Date.now()}`,
          plateNumber: newVehicle.plateNumber,
          type: newVehicle.type || 'Pickup',
          status: 'Tersedia',
          driverId: newVehicle.driverId
      });
      setShowNewVehicleModal(false);
      setNewVehicle({ status: 'Tersedia', type: 'Pickup' });
  };

  const updateStatus = (id: string, status: Delivery['status']) => {
      const delivery = deliveries.find(d => d.id === id);
      if (delivery) {
          updateDelivery({ ...delivery, status });
      }
  };

  const handleCompleteDelivery = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showCompleteModal) return;

      if (!window.confirm("Apakah Anda yakin ingin menyelesaikan pengiriman ini? Pastikan semua data sudah benar.")) {
          return;
      }

      const delivery = deliveries.find(d => d.id === showCompleteModal);
      if (delivery) {
          updateDelivery({
              ...delivery,
              status: 'Selesai',
              endTime: new Date().toISOString(),
              notes: completionData.notes,
              proofImage: completionData.proofImage // In real app, this would be a URL
          });
          
          // Update Vehicle Status to Available
          const vehicle = vehicles.find(v => v.id === delivery.vehicleId);
          if (vehicle) {
              // Logic to free up vehicle? Maybe not automatically, but for now let's assume driver returns.
          }
      }
      setShowCompleteModal(null);
      setCompletionData({ notes: '', proofImage: '' });
  };

  const handlePrintManifest = async (delivery: Delivery) => {
      const transaction = transactions.find(t => t.id === delivery.transactionId);
      const driver = employees.find(e => e.id === delivery.driverId);
      const vehicle = vehicles.find(v => v.id === delivery.vehicleId);

      if (!transaction) return;

      const printerService = new PrinterService(printerConfig);
      const content = [
          `SURAT JALAN`,
          `No: ${delivery.id}`,
          `Tgl: ${new Date().toLocaleString()}`,
          `--------------------------------`,
          `Driver: ${driver?.name || '-'}`,
          `Kendaraan: ${vehicle?.plateNumber || '-'}`,
          `Tujuan: ${delivery.customerName}`,
          `Alamat: ${delivery.address}`,
          `--------------------------------`,
          `ITEM PENGIRIMAN:`,
          ...transaction.items.map(item => `- ${item.name} x${item.qty} ${item.unit}`),
          `--------------------------------`,
          `Catatan: ${delivery.notes || '-'}`,
          `\n\n`,
          `( Tanda Tangan Penerima )`
      ].join('\n');

      await printerService.print(content);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck size={32} className="text-brand-red" />
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">Distribusi & Pengiriman</h1>
            <p className="text-gray-400 text-sm">Manajemen armada, kurir, dan pengiriman pesanan.</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowNewVehicleModal(true)}
                className="bg-[#1e1e1e] border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5"
            >
                <Plus size={18} /> Armada Baru
            </button>
            <button 
                onClick={() => setShowNewDeliveryModal(true)}
                className="bg-brand-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
            >
                <Plus size={18} /> Buat Pengiriman
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'deliveries' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Daftar Pengiriman
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'vehicles' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Armada & Kurir
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reports' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Laporan Pengiriman
        </button>
      </div>

      {/* Content */}
      {activeTab === 'deliveries' ? (
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Truck size={20} className="text-brand-gold" />
                      Daftar Pengiriman Aktif
                  </h3>
                  <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/30">Persiapan: {deliveries.filter(d => d.status === 'Persiapan').length}</span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">Dikirim: {deliveries.filter(d => d.status === 'Dikirim').length}</span>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                              <th className="p-3">ID / Waktu</th>
                              <th className="p-3">Customer & Wilayah</th>
                              <th className="p-3">Armada & Driver</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Aksi</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300">
                          {deliveries.filter(d => d.status !== 'Selesai' && d.status !== 'Gagal').map(d => (
                              <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3">
                                      <div className="font-mono text-xs text-brand-gold">{d.id}</div>
                                      <div className="text-xs text-gray-500">{new Date(d.startTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </td>
                                  <td className="p-3">
                                      <div className="font-bold text-white">{d.customerName}</div>
                                      <div className="text-xs text-gray-400 flex items-center gap-1">
                                          <MapPin size={10} />
                                          {d.address}
                                      </div>
                                  </td>
                                  <td className="p-3">
                                      <div className="flex items-center gap-2">
                                          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                                              {vehicles.find(v => v.id === d.vehicleId)?.plateNumber || '-'}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                              ({employees.find(e => e.id === d.driverId)?.name || '-'})
                                          </span>
                                      </div>
                                  </td>
                                  <td className="p-3">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                          d.status === 'Persiapan' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                      }`}>
                                          {d.status}
                                      </span>
                                  </td>
                                  <td className="p-3 text-right">
                                      <div className="flex justify-end gap-2">
                                          {d.status === 'Persiapan' && (
                                              <>
                                                  <button 
                                                      onClick={() => handlePrintManifest(d)}
                                                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors"
                                                      title="Cetak Surat Jalan"
                                                  >
                                                      <Printer size={16} />
                                                  </button>
                                                  <button 
                                                      onClick={() => updateStatus(d.id, 'Dikirim')}
                                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
                                                  >
                                                      Mulai Kirim
                                                  </button>
                                              </>
                                          )}
                                          {d.status === 'Dikirim' && (
                                              <button 
                                                  onClick={() => setShowCompleteModal(d.id)}
                                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition-colors flex items-center gap-1 ml-auto"
                                              >
                                                  <CheckCircle size={12} />
                                                  Selesaikan
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {deliveries.filter(d => d.status !== 'Selesai' && d.status !== 'Gagal').length === 0 && (
                              <tr>
                                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                      Tidak ada pengiriman aktif saat ini.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : activeTab === 'vehicles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white/5 rounded-lg">
                              <Truck size={24} className="text-brand-gold" />
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${
                              vehicle.status === 'Tersedia' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                              vehicle.status === 'Dalam Pengiriman' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                              'border-red-500/30 text-red-500 bg-red-500/10'
                          }`}>
                              {vehicle.status}
                          </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{vehicle.plateNumber}</h3>
                      <p className="text-sm text-gray-400 mb-4">{vehicle.type}</p>
                      
                      <div className="border-t border-white/5 pt-4">
                          <p className="text-xs text-gray-500 mb-1">Driver Penanggung Jawab:</p>
                          <div className="flex items-center gap-2 text-sm text-white">
                              <User size={14} />
                              {employees.find(e => e.id === vehicle.driverId)?.name || '-'}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-brand-gold" />
                  Laporan Pengiriman
              </h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                              <th className="p-3">ID Pengiriman</th>
                              <th className="p-3">Tanggal</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Driver</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Durasi</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300">
                          {deliveries.map(d => (
                              <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="p-3 font-mono text-xs">{d.id}</td>
                                  <td className="p-3">{new Date(d.startTime || '').toLocaleDateString()}</td>
                                  <td className="p-3">{d.customerName}</td>
                                  <td className="p-3">{employees.find(e => e.id === d.driverId)?.name || '-'}</td>
                                  <td className="p-3">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          d.status === 'Selesai' ? 'bg-green-500/20 text-green-500' :
                                          d.status === 'Gagal' ? 'bg-red-500/20 text-red-500' :
                                          'bg-blue-500/20 text-blue-500'
                                      }`}>
                                          {d.status}
                                      </span>
                                  </td>
                                  <td className="p-3">
                                      {d.endTime && d.startTime ? 
                                          `${Math.round((new Date(d.endTime).getTime() - new Date(d.startTime).getTime()) / 60000)} menit` 
                                          : '-'
                                      }
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* New Delivery Modal */}
      {showNewDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Buat Pengiriman Baru</h2>
                  <form onSubmit={handleAddDelivery} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Pilih Transaksi (Pending)</label>
                          <select 
                              required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              onChange={e => {
                                  const t = transactions.find(tr => tr.id === e.target.value);
                                  const customer = customers.find(c => c.name === t?.customerName);
                                  setNewDelivery({
                                      ...newDelivery, 
                                      transactionId: e.target.value,
                                      address: customer?.address || 'Alamat tidak tersedia'
                                  });
                              }}
                          >
                              <option value="">-- Pilih Invoice --</option>
                              {transactions.slice(0, 10).map(t => (
                                  <option key={t.id} value={t.id}>{t.id} - {t.customerName}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Alamat Tujuan</label>
                          <textarea 
                              required
                              value={newDelivery.address}
                              onChange={e => setNewDelivery({...newDelivery, address: e.target.value})}
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm h-20"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Pilih Armada</label>
                              <select 
                                  required
                                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                                  onChange={e => setNewDelivery({...newDelivery, vehicleId: e.target.value})}
                              >
                                  <option value="">-- Pilih --</option>
                                  {vehicles.filter(v => v.status === 'Tersedia').map(v => (
                                      <option key={v.id} value={v.id}>{v.plateNumber} ({v.type})</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Pilih Driver</label>
                              <select 
                                  required
                                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                                  onChange={e => setNewDelivery({...newDelivery, driverId: e.target.value})}
                              >
                                  <option value="">-- Pilih --</option>
                                  {employees.map(e => (
                                      <option key={e.id} value={e.id}>{e.name}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowNewDeliveryModal(false)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* New Vehicle Modal */}
      {showNewVehicleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Tambah Armada Baru</h2>
                  <form onSubmit={handleAddVehicle} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Nomor Polisi</label>
                          <input 
                              type="text" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm uppercase"
                              placeholder="BE XXXX YY"
                              onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Jenis Kendaraan</label>
                          <select 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              onChange={e => setNewVehicle({...newVehicle, type: e.target.value as Vehicle['type']})}
                          >
                              <option value="Pickup">Pickup</option>
                              <option value="Truk Engkel">Truk Engkel</option>
                              <option value="Truk Pendingin">Truk Pendingin</option>
                              <option value="Motor">Motor</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Driver Default (Opsional)</label>
                          <select 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              onChange={e => setNewVehicle({...newVehicle, driverId: e.target.value})}
                          >
                              <option value="">-- Tidak Ada --</option>
                              {employees.map(e => (
                                  <option key={e.id} value={e.id}>{e.name}</option>
                              ))}
                          </select>
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowNewVehicleModal(false)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Complete Delivery Modal */}
      {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Selesaikan Pengiriman</h2>
                  <form onSubmit={handleCompleteDelivery} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Catatan Penerimaan</label>
                          <textarea 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm h-24"
                              placeholder="Diterima oleh siapa? Kondisi barang?"
                              value={completionData.notes}
                              onChange={e => setCompletionData({...completionData, notes: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Bukti Foto (Simulasi)</label>
                          <div className="w-full h-32 bg-black/30 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-brand-gold/50 hover:text-brand-gold transition-colors cursor-pointer">
                              <Camera size={24} className="mb-2" />
                              <span className="text-xs">Klik untuk ambil foto</span>
                          </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowCompleteModal(null)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Selesai</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Distribution;
