import React, { useState } from 'react';
import { Search, Plus, ArrowRightLeft, X as XIcon, Trash2, Beef, Package, Truck, Scale, Printer } from 'lucide-react';
import { Product, ProductCategory, CattleOrder, PrinterConnection, User as UserType, Role } from '../types';
import { useStore } from '../StoreContext';
import { createPortal } from 'react-dom';
import { PrinterService } from '../utils/printer';

interface InventoryProps {
  user?: UserType;
}

const PrintableStockReport = ({ products, paperSize }: { products: Product[]; paperSize: string }) => {
  const isA4 = paperSize === 'A4';
  const isLegal = paperSize === 'Legal';
  const isFolio = paperSize === 'Folio';
  const widthClass = (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-full max-w-4xl';

  return (
    <div className={`print-only-container hidden print:block bg-white text-black p-8 mx-auto a4-report ${widthClass}`}>
        <header className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Subaru Daging Sapi</h1>
            <p className="text-sm">Laporan Stok Inventaris</p>
            <p className="text-xs">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </header>
        
        <table className="w-full text-sm border-collapse border border-black">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left">Produk</th>
                    <th className="border border-black p-2 text-left">Kategori</th>
                    <th className="border border-black p-2 text-right">Stok</th>
                    <th className="border border-black p-2 text-left">Satuan</th>
                    <th className="border border-black p-2 text-right">HPP</th>
                </tr>
            </thead>
            <tbody>
                {products.map(p => (
                    <tr key={p.id}>
                        <td className="border border-black p-2">{p.name}</td>
                        <td className="border border-black p-2">{p.category}</td>
                        <td className="border border-black p-2 text-right">{p.stock}</td>
                        <td className="border border-black p-2">{p.unit}</td>
                        <td className="border border-black p-2 text-right">Rp {p.price.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div className="mt-8 flex justify-end">
            <div className="text-center w-48">
                <p className="mb-16 text-sm">Kepala Gudang</p>
                <p className="border-t border-black font-bold">( ............................ )</p>
            </div>
        </div>
    </div>
  );
};

const PrintablePO = ({ order, paperSize }: { order: CattleOrder; paperSize: string }) => {
  const isA4 = paperSize === 'A4';
  const isLegal = paperSize === 'Legal';
  const isFolio = paperSize === 'Folio';
  const widthClass = (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-full max-w-4xl';

  return (
    <div className={`print-only-container hidden print:block bg-white text-black p-8 mx-auto a4-report ${widthClass}`}>
        <header className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Subaru Daging Sapi</h1>
            <h2 className="text-xl font-bold">PURCHASE ORDER SAPI</h2>
            <p className="text-sm">No: {order.id}</p>
        </header>
        
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
                <p className="font-bold">Supplier:</p>
                <p>{order.supplierName}</p>
            </div>
            <div className="text-right">
                <p><span className="font-bold">Tanggal Order:</span> {order.orderDate}</p>
                <p><span className="font-bold">Kendaraan:</span> {order.vehiclePlate}</p>
            </div>
        </div>
        
        <table className="w-full text-sm border-collapse border border-black mb-8">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left">Deskripsi</th>
                    <th className="border border-black p-2 text-right">Kuantitas</th>
                    <th className="border border-black p-2 text-left">Kondisi</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border border-black p-2">Sapi Hidup</td>
                    <td className="border border-black p-2 text-right">{order.quantity} Ekor</td>
                    <td className="border border-black p-2">{order.healthCondition}</td>
                </tr>
            </tbody>
        </table>
        
        <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="text-center">
                <p className="mb-16">Supplier</p>
                <p className="border-t border-black font-bold">( {order.supplierName} )</p>
            </div>
            <div className="text-center">
                <p className="mb-16">Penerima</p>
                <p className="border-t border-black font-bold">( ............................ )</p>
            </div>
        </div>
    </div>
  );
};

const Inventory: React.FC<InventoryProps> = ({ user }) => {
  const { 
    products, cattleOrders, addCattleOrder, updateCattleOrder, deleteCattleOrder, 
    searchQuery, outlets, transferStock, printerConfig, addSystemLog, 
    addProduct, updateProduct, deleteProduct,
    navigationParams, setNavigationParams, showToast 
  } = useStore();
  const canViewCost = user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.DIRECTOR;
  const canManageProducts = user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.DIRECTOR;
  const canManageCattle = user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.DIRECTOR || user?.role === Role.RPH_ADMIN;
  
  const [activeTab, setActiveTab] = useState<'products' | 'cattle' | 'catalog'>('products');
  
  // ... existing state
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedOutlet, setSelectedOutlet] = useState('Semua');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCattleModalOpen, setIsCattleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ name: '', category: ProductCategory.PREMIUM, price: 0, stock: 0, minStock: 5, unit: 'kg', description: '', image: '' });
  const [transferData, setTransferData] = useState({ productId: '', quantity: 0, toOutlet: 'TAMIN-01' });
  const [editingCattle, setEditingCattle] = useState<CattleOrder | null>(null);
  const [cattleForm, setCattleForm] = useState<Partial<CattleOrder>>({ supplierName: '', orderDate: '', quantity: 0, weightType: '', healthCondition: '', arrivalDate: '', driverName: '', vehiclePlate: '', slaughterDate: '', slaughteredCount: 0, totalLiveWeight: 0, totalCarcassWeight: 0, distribution: { taminTime: '', wayHalimTime: '', officeTime: '' } });

  const printerService = new PrinterService(printerConfig);

  const [selectedPO, setSelectedPO] = useState<CattleOrder | null>(null);

  const handlePrintPO = (order: CattleOrder) => {
      if (printerConfig.connection === PrinterConnection.BLUETOOTH) {
          const printData = {
              transactionId: order.id,
              date: order.orderDate,
              supplier: order.supplierName,
              items: [{ name: 'Sapi Hidup', qty: order.quantity, price: 0, total: 0 }]
          };
          printerService.print(printData);
      } else {
          setSelectedPO(order);
          setTimeout(() => {
              window.print();
          }, 500);
      }
  };

  const getStockStatus = (stock: number, min: number) => {
    if (stock === 0) return <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20">Habis</span>;
    if (stock < min) return <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold border border-amber-500/20">Rendah</span>;
    return <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Aman</span>;
  };

  const totalCattleIn = cattleOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalSlaughtered = cattleOrders.reduce((sum, o) => sum + (o.slaughteredCount || 0), 0);
  const totalRemaining = totalCattleIn - totalSlaughtered;
  const activeOrdersCount = cattleOrders.filter(o => o.totalLiveWeight && o.totalLiveWeight > 0).length;
  const weightedYield = cattleOrders.reduce((acc, o) => o.totalLiveWeight > 0 ? acc + ((o.totalCarcassWeight || 0) / o.totalLiveWeight) : acc, 0);
  const avgYield = activeOrdersCount > 0 ? (weightedYield / activeOrdersCount) * 100 : 0;
  const avgShrinkage = 100 - avgYield;

  const handleOpenAdd = () => { setEditingProduct(null); setFormData({ name: '', category: ProductCategory.PREMIUM, price: 0, stock: 0, minStock: 5, unit: 'kg', description: '', image: '' }); setIsProductModalOpen(true); };
  const handleOpenEdit = (product: Product) => { setEditingProduct(product); setFormData({ ...product }); setIsProductModalOpen(true); };
  const handleDelete = (id: string) => {
    setConfirmData({
      isOpen: true,
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini?',
      onConfirm: () => {
        deleteProduct(id);
        showToast('Produk berhasil dihapus', 'success');
      }
    });
  };

  // Handle Navigation Params from Dashboard
  React.useEffect(() => {
      if (navigationParams) {
          if (navigationParams.tab === 'master_data' && navigationParams.action === 'add_product') {
              setActiveTab('products');
              // Small delay to ensure state is ready
              setTimeout(() => handleOpenAdd(), 100);
          } else if (navigationParams.tab === 'stock_opname') {
              setActiveTab('products');
              setTimeout(() => setIsTransferModalOpen(true), 100);
          }
          setNavigationParams(null);
      }
  }, [navigationParams, setNavigationParams]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) { 
      updateProduct({ ...editingProduct, ...formData } as Product);
      if (user) {
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Edit Produk: ${formData.name}`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'Inventory',
              device: 'Web'
          });
      }
    } 
    else { 
      const newProduct: Product = { ...formData as Product, id: `p-${Date.now()}`, batchNumber: `BATCH-${new Date().getFullYear()}`, expiryDate: '2025-01-01' }; 
      addProduct(newProduct);
      if (user) {
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Tambah Produk Baru: ${formData.name}`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'Inventory',
              device: 'Web'
          });
      }
    }
    setIsProductModalOpen(false);
  };

  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === transferData.productId);
    
    if (!product) return;
    if (product.stock < transferData.quantity) {
      showToast('Stok tidak mencukupi untuk transfer!', 'error');
      return;
    }

    // Call Global Store Action
    transferStock(transferData.productId, transferData.quantity, transferData.toOutlet);
    
    if (user) {
        addSystemLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            role: user.role,
            action: 'ACTION',
            details: `Transfer Stok: ${transferData.quantity} unit ke ${outlets.find(o => o.id === transferData.toOutlet)?.name}`,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1',
            location: 'Inventory',
            device: 'Web'
        });
    }

    showToast(`Sukses! Transfer ${transferData.quantity} ${product.unit} ${product.name} sedang diproses.`, 'success');
    setIsTransferModalOpen(false);
  };

  const handleEditCattle = (order: CattleOrder) => {
    setEditingCattle(order);
    setCattleForm({ ...order });
    setIsCattleModalOpen(true);
  };

  const handleDeleteCattle = (id: string) => {
    setConfirmData({
      isOpen: true,
      title: 'Hapus PO Sapi',
      message: 'Apakah Anda yakin ingin menghapus data PO Sapi ini?',
      onConfirm: () => {
        deleteCattleOrder(id);
        showToast('Data PO Sapi berhasil dihapus', 'success');
      }
    });
  };

  const handleSaveCattle = (e: React.FormEvent) => {
    e.preventDefault();
    const orderData: CattleOrder = {
      ...cattleForm as CattleOrder,
      id: editingCattle ? editingCattle.id : `CO-${Date.now()}`,
      distribution: cattleForm.distribution || { taminTime: '', wayHalimTime: '', officeTime: '' },
      slaughteredCount: cattleForm.slaughteredCount || 0,
      totalLiveWeight: cattleForm.totalLiveWeight || 0,
      totalCarcassWeight: cattleForm.totalCarcassWeight || 0
    };

    if (editingCattle) {
      updateCattleOrder(orderData);
      if (user) {
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Update PO Sapi: ${orderData.id}`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'Inventory',
              device: 'Web'
          });
      }
    } else {
      addCattleOrder(orderData);
      if (user) {
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Buat PO Sapi Baru: ${orderData.id} (${orderData.quantity} Ekor)`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'Inventory',
              device: 'Web'
          });
      }
    }
    setIsCattleModalOpen(false);
    setEditingCattle(null);
    setCattleForm({ supplierName: '', orderDate: '', quantity: 0, weightType: '', healthCondition: '', arrivalDate: '', driverName: '', vehiclePlate: '', slaughterDate: '', slaughteredCount: 0, totalLiveWeight: 0, totalCarcassWeight: 0, distribution: { taminTime: '', wayHalimTime: '', officeTime: '' } });
  }

  const handlePrintStock = () => { window.print(); };
  const effectiveSearch = searchQuery || localSearch;
  const filtered = products.filter(p => {
    return (p.name.toLowerCase().includes(effectiveSearch.toLowerCase()) || p.batchNumber?.toLowerCase().includes(effectiveSearch.toLowerCase())) &&
           (categoryFilter === 'Semua' || p.category === categoryFilter) &&
           (statusFilter === 'Semua' || (statusFilter === 'Habis' && p.stock === 0) || (statusFilter === 'Rendah' && p.stock > 0 && p.stock < p.minStock) || (statusFilter === 'Aman' && p.stock >= p.minStock));
  });

  return (
    <div className="space-y-6 relative">
      {createPortal(<PrintableStockReport products={products} paperSize={printerConfig.type} />, document.body)}
      {selectedPO && createPortal(<PrintablePO order={selectedPO} paperSize={printerConfig.type} />, document.body)}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white font-serif">Manajemen Gudang</h2>
          <p className="text-gray-400 text-sm">Kelola stok daging, batch, dan kadaluarsa.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {activeTab === 'products' ? (
             <>
               <button onClick={handlePrintStock} className="flex-1 lg:flex-none items-center gap-2 px-3 py-2 bg-white text-black font-bold rounded-lg text-sm flex justify-center"><Printer size={16} /> Laporan</button>
               <button onClick={() => setIsTransferModalOpen(true)} className="flex-1 lg:flex-none items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg border border-white/10 text-sm flex justify-center"><ArrowRightLeft size={16} /> Transfer</button>
               {canManageProducts && <button onClick={handleOpenAdd} className="flex-1 lg:flex-none items-center gap-2 px-3 py-2 bg-brand-red text-white rounded-lg text-sm flex justify-center"><Plus size={16} /> Produk</button>}
             </>
          ) : (
              canManageCattle && <button onClick={() => setIsCattleModalOpen(true)} className="w-full lg:w-auto flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold rounded-lg text-sm justify-center"><Plus size={16} /> Buat PO Sapi</button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-white/10 overflow-x-auto">
        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === 'products' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'}`}><Package size={16} /> Stok Produk</button>
        <button onClick={() => setActiveTab('catalog')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === 'catalog' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'}`}><Beef size={16} /> Katalog Visual</button>
        <button onClick={() => setActiveTab('cattle')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === 'cattle' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'}`}><Beef size={16} /> PO Sapi Hidup</button>
      </div>

      {activeTab === 'products' ? (
        <>
            {/* Responsive Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center bg-[#1e1e1e] p-4 rounded-xl border border-white/5">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" placeholder="Cari..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full bg-brand-black border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-red" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red w-full sm:w-auto">
                        <option value="Semua">Semua Gerai</option>
                        {outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red w-full sm:w-auto">
                        <option value="Semua">Kategori</option>
                        {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red w-full sm:w-auto">
                        <option value="Semua">Status</option>
                        <option value="Aman">Aman</option>
                        <option value="Stok Rendah">Rendah</option>
                        <option value="Stok Habis">Habis</option>
                    </select>
                </div>
            </div>

            {/* Table Container for Scroll */}
            <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                    <thead className="bg-[#121212] text-gray-200 font-medium border-b border-white/5">
                    <tr><th className="px-6 py-4">Produk</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4 text-right">Harga</th>{canViewCost && <th className="px-6 py-4 text-right">HPP</th>}<th className="px-6 py-4 text-center">Stok</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                    {filtered.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4"><p className="text-white font-medium">{product.name}</p><p className="text-xs">{product.unit}</p></td>
                        <td className="px-6 py-4"><span className="bg-gray-800 px-2 py-1 rounded text-xs">{product.category}</span></td>
                        <td className="px-6 py-4 text-xs">{selectedOutlet === 'Semua' ? 'Gudang Utama' : selectedOutlet}</td>
                        <td className="px-6 py-4 text-right font-mono text-white">{product.price.toLocaleString('id-ID')}</td>
                        {canViewCost && <td className="px-6 py-4 text-right font-mono text-gray-400">{product.costPrice ? product.costPrice.toLocaleString('id-ID') : '-'}</td>}
                        <td className="px-6 py-4 text-center"><span className={`font-bold ${product.stock < product.minStock ? 'text-brand-red' : 'text-white'}`}>{product.stock}</span></td>
                        <td className="px-6 py-4 text-center">{getStockStatus(product.stock, product.minStock)}</td>
                        <td className="px-6 py-4 text-right">
                          {canManageProducts && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenEdit(product)} className="text-blue-400 hover:bg-blue-400/10 p-1 rounded">Edit</button>
                              <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      ) : activeTab === 'catalog' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(product => (
                <div key={product.id} className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden group">
                    <div className="aspect-square bg-black/40 relative overflow-hidden">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                <Package size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => handleOpenEdit(product)}
                                className="bg-brand-red text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                            >
                                Ganti Foto
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <p className="text-white font-bold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
         /* CATTLE PO VIEW */
         <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5"><p className="text-xs text-gray-400">Total Masuk</p><h3 className="text-xl font-bold text-white">{totalCattleIn} <span className="text-xs font-normal">Ekor</span></h3></div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5"><p className="text-xs text-gray-400">Terpotong</p><h3 className="text-xl font-bold text-white">{totalSlaughtered} <span className="text-xs font-normal">Ekor</span></h3></div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5"><p className="text-xs text-gray-400">Sisa Kandang</p><h3 className="text-xl font-bold text-white">{totalRemaining} <span className="text-xs font-normal">Ekor</span></h3></div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5"><p className="text-xs text-gray-400">Susut</p><h3 className="text-xl font-bold text-red-400">{activeOrdersCount > 0 ? avgShrinkage.toFixed(1) : 0}%</h3></div>
            </div>
            <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                        <thead className="bg-[#121212] text-gray-200 font-medium border-b border-white/5">
                        <tr><th className="px-6 py-4">ID / Supplier</th><th className="px-6 py-4">Jml Order</th><th className="px-6 py-4">Logistik</th><th className="px-6 py-4">Pemotongan</th><th className="px-6 py-4">Timbangan</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {cattleOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4"><p className="text-white font-bold">{order.supplierName}</p><p className="text-xs text-gray-500 font-mono">{order.id}</p></td>
                                    <td className="px-6 py-4"><p className="text-white font-bold">{order.quantity} Ekor</p><p className="text-xs">{order.weightType}</p></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-1"><Truck size={12}/> {order.vehiclePlate}</div></td>
                                    <td className="px-6 py-4"><span className="text-red-400 font-medium block">{order.slaughterDate.split('T')[0]}</span><span className="text-xs">Potong: {order.slaughteredCount}</span></td>
                                    <td className="px-6 py-4"><div className="text-xs">Hidup: {order.totalLiveWeight}<br/>Daging: {order.totalCarcassWeight}</div></td>
                                    <td className="px-6 py-4 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button onClick={() => handlePrintPO(order)} className="text-gray-400 hover:bg-white/10 p-1 rounded"><Printer size={16} /></button>
                                        {canManageCattle && (
                                          <>
                                            <button onClick={() => handleEditCattle(order)} className="text-blue-400 hover:bg-blue-400/10 p-1 rounded">Edit</button>
                                            <button onClick={() => handleDeleteCattle(order.id)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={16} /></button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>
      )}

      {/* MODALS - Fixed responsive width */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-[95%] max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-xl font-bold text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><XIcon size={24} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <input type="text" placeholder="Nama Produk" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
              <div className="grid grid-cols-2 gap-4">
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white">
                      {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Satuan (kg, pcs, dll)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Stok Awal</label>
                      <input type="number" placeholder="Stok" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Min. Stok</label>
                      <input type="number" placeholder="Min Stok" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Harga Modal (Rp)</label>
                      <input type="number" placeholder="HPP" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Harga Jual (Rp)</label>
                      <input type="number" placeholder="Harga" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Batch Number</label>
                      <input type="text" placeholder="BATCH-001" value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
                  <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Tgl Kadaluarsa</label>
                      <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1">URL Foto Produk</label>
                  <input type="text" placeholder="https://..." value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
              </div>
              <textarea placeholder="Deskripsi Produk" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white h-20 resize-none" />
              <button type="submit" className="w-full py-3 bg-brand-red text-white font-bold rounded-lg shadow-lg shadow-brand-red/20">Simpan Produk</button>
            </form>
          </div>
        </div>
      )}

      {/* --- CATTLE PO MODAL --- */}
      {isCattleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-[95%] max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-xl font-bold text-white">{editingCattle ? 'Edit PO Sapi' : 'Buat PO Sapi Baru'}</h3>
              <button onClick={() => setIsCattleModalOpen(false)}><XIcon size={24} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSaveCattle} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nama Supplier</label>
                  <input type="text" required value={cattleForm.supplierName} onChange={e => setCattleForm({...cattleForm, supplierName: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tanggal Order</label>
                  <input type="date" required value={cattleForm.orderDate} onChange={e => setCattleForm({...cattleForm, orderDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jumlah (Ekor)</label>
                  <input type="number" required min="1" value={cattleForm.quantity} onChange={e => setCattleForm({...cattleForm, quantity: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jenis Timbangan</label>
                  <select value={cattleForm.weightType} onChange={e => setCattleForm({...cattleForm, weightType: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white">
                    <option value="">Pilih Jenis</option>
                    <option value="Hidup">Timbang Hidup</option>
                    <option value="Karkas">Timbang Karkas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kondisi Kesehatan</label>
                  <input type="text" value={cattleForm.healthCondition} onChange={e => setCattleForm({...cattleForm, healthCondition: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" placeholder="Sehat / Sakit / Cacat" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tanggal Tiba</label>
                  <input type="date" value={cattleForm.arrivalDate} onChange={e => setCattleForm({...cattleForm, arrivalDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Truck size={16} /> Logistik</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Supir" value={cattleForm.driverName} onChange={e => setCattleForm({...cattleForm, driverName: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                  <input type="text" placeholder="Plat Nomor Kendaraan" value={cattleForm.vehiclePlate} onChange={e => setCattleForm({...cattleForm, vehiclePlate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Scale size={16} /> Data Pemotongan (Opsional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Tgl Potong</label>
                      <input type="date" value={cattleForm.slaughterDate} onChange={e => setCattleForm({...cattleForm, slaughterDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" />
                   </div>
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Jml Terpotong</label>
                      <input type="number" value={cattleForm.slaughteredCount} onChange={e => setCattleForm({...cattleForm, slaughteredCount: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" />
                   </div>
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Total Bobot Hidup (Kg)</label>
                      <input type="number" value={cattleForm.totalLiveWeight} onChange={e => setCattleForm({...cattleForm, totalLiveWeight: parseFloat(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" />
                   </div>
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Total Bobot Karkas (Kg)</label>
                      <input type="number" value={cattleForm.totalCarcassWeight} onChange={e => setCattleForm({...cattleForm, totalCarcassWeight: parseFloat(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" />
                   </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-brand-gold hover:bg-yellow-600 text-black font-bold rounded-lg mt-4">
                {editingCattle ? 'Simpan Perubahan' : 'Buat Purchase Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TRANSFER STOCK MODAL --- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><ArrowRightLeft className="text-brand-gold" /> Transfer Stok</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
            </div>
            <form onSubmit={handleTransferStock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pilih Produk</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                  value={transferData.productId}
                  onChange={e => setTransferData({...transferData, productId: e.target.value})}
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Sisa: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tujuan Cabang</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                  value={transferData.toOutlet}
                  onChange={e => setTransferData({...transferData, toOutlet: e.target.value})}
                >
                  {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-sm text-gray-400 mb-1">Jumlah</label>
                 <input 
                    type="number" min="1" required
                    value={transferData.quantity}
                    onChange={e => setTransferData({...transferData, quantity: parseInt(e.target.value)})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                 />
                 <p className="text-xs text-gray-500 mt-1">Stok akan dikurangi dari Gudang Utama</p>
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="submit" className="w-full py-3 bg-brand-gold hover:bg-yellow-600 text-black font-bold rounded-lg flex items-center justify-center gap-2">
                   Konfirmasi Transfer
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;