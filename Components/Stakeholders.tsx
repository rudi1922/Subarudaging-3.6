import React, { useState } from 'react';
import { Users, Truck, Search, Plus, Phone, Mail, MapPin, Edit, Trash2, Save, X as XIcon, User as UserIcon, Calendar, DollarSign, FileText, Send, MessageCircle, Minus, AlertCircle } from 'lucide-react';
import { Customer, Supplier, User as UserType } from '../types';
import { useStore } from '../StoreContext';

interface StakeholdersProps {
  user?: UserType;
}

const Stakeholders: React.FC<StakeholdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [localSearch, setLocalSearch] = useState('');
  const { searchQuery, customers, setCustomers, addCustomer, addSystemLog, suppliers, setSuppliers } = useStore();
  
  // Data State
  // const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS); // REMOVED LOCAL STATE
  // const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS); // REMOVED LOCAL STATE

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Validation State
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  // Purchase Order & Broadcast State
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<Supplier | null>(null);
  
  // PO Items State
  const [poItems, setPoItems] = useState<{name: string, qty: number, price: number}[]>([
    { name: '', qty: 1, price: 0 }
  ]);
  
  const [broadcastMsg, setBroadcastMsg] = useState('Halo Kak! Ada promo spesial minggu ini di Subaru Daging Sapi. Dapatkan diskon 20% untuk pembelian Iga Sapi. Yuk order sekarang sebelum kehabisan!');

  // Form State
  const initialCustomerForm: Partial<Customer> = { 
    name: '', 
    type: 'Umum', 
    phone: '', 
    email: '', 
    totalSpent: 0,
    lastVisit: new Date().toISOString().split('T')[0]
  };
  const initialSupplierForm: Partial<Supplier> = { companyName: '', category: 'Meat Import', contactPerson: '', phone: '', email: '', address: '' };
  
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>(initialCustomerForm);
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>(initialSupplierForm);

  // Handlers
  const handleOpenAdd = () => {
    setEditingId(null);
    setCustomerForm(initialCustomerForm);
    setSupplierForm(initialSupplierForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (item: Customer | Supplier) => {
    setEditingId(item.id);
    setErrors({});
    if (activeTab === 'customers' && 'type' in item) {
      setCustomerForm(item as Customer);
    } else if (activeTab === 'suppliers' && 'companyName' in item) {
      setSupplierForm(item as Supplier);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      if (activeTab === 'customers') {
        setCustomers(prev => prev.filter(c => c.id !== id));
      } else {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const validateForm = (data: Partial<Customer> | Partial<Supplier>) => {
    const newErrors: { phone?: string; email?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+\-()\s]{7,}$/;

    if (data.email && data.email !== '-' && !emailRegex.test(data.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (data.phone && !phoneRegex.test(data.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid (min 7 digit)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentData = activeTab === 'customers' ? customerForm : supplierForm;
    
    if (!validateForm(currentData)) {
      return;
    }

    if (activeTab === 'customers') {
      if (editingId) {
        setCustomers(prev => prev.map(c => c.id === editingId ? { ...c, ...customerForm } as Customer : c));
        if (user) {
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Edit Pelanggan: ${customerForm.name}`,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Stakeholders',
                device: 'Web'
            });
        }
      } else {
        const newCustomer: Customer = { 
          ...customerForm as Customer, 
          id: `SBR-${Math.floor(10000 + Math.random() * 90000)}`, // Simulate SBR Code
          totalSpent: customerForm.totalSpent || 0, 
          lastVisit: customerForm.lastVisit || new Date().toISOString().split('T')[0] 
        };
        addCustomer(newCustomer);
        if (user) {
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Tambah Pelanggan Baru: ${newCustomer.name}`,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Stakeholders',
                device: 'Web'
            });
        }
      }
    } else {
      if (editingId) {
        setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...supplierForm } as Supplier : s));
        if (user) {
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Edit Supplier: ${supplierForm.companyName}`,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Stakeholders',
                device: 'Web'
            });
        }
      } else {
        const newSupplier: Supplier = { ...supplierForm as Supplier, id: `s-${Date.now()}` };
        setSuppliers(prev => [newSupplier, ...prev]);
        if (user) {
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Tambah Supplier Baru: ${newSupplier.companyName}`,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Stakeholders',
                device: 'Web'
            });
        }
      }
    }
    setIsModalOpen(false);
  };

  const handleOpenPO = (supplier: Supplier) => {
    setSelectedSupplierForPO(supplier);
    setPoItems([{ name: '', qty: 1, price: 0 }]); // Reset items
    setIsPOModalOpen(true);
  };

  const updatePoItem = (index: number, field: string, value: any) => {
      const newItems = [...poItems];
      // @ts-expect-error - Dynamic assignment
      newItems[index][field] = value;
      setPoItems(newItems);
  };

  const addPoItem = () => {
      setPoItems([...poItems, { name: '', qty: 1, price: 0 }]);
  };

  const removePoItem = (index: number) => {
      if (poItems.length > 1) {
          setPoItems(poItems.filter((_, i) => i !== index));
      }
  };

  const handleSendPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplierForPO) {
        let itemsList = '';
        let totalEst = 0;

        poItems.forEach((item, idx) => {
            const subtotal = item.qty * item.price;
            totalEst += subtotal;
            itemsList += `${idx + 1}. ${item.name} (${item.qty} unit) @ Rp${item.price.toLocaleString()} = Rp${subtotal.toLocaleString()}\n`;
        });

        const poMessage = `Halo ${selectedSupplierForPO.companyName}, saya ingin memesan stok berikut:\n\n${itemsList}\nTotal Estimasi: Rp ${totalEst.toLocaleString()}\n\nMohon konfirmasi ketersediaan dan pengiriman. Terima kasih.`;

        const url = `https://wa.me/${selectedSupplierForPO.phone}?text=${encodeURIComponent(poMessage)}`;
        window.open(url, '_blank');
        setIsPOModalOpen(false);
    }
  };

  const handleSendBroadcast = () => {
    if(customers.length > 0) {
        const demoCustomer = customers[0];
        const url = `https://wa.me/${demoCustomer.phone}?text=${encodeURIComponent(broadcastMsg)}`;
        
        alert(`Simulasi: Membuka WhatsApp Web untuk Broadcast.\nTarget: ${customers.length} Pelanggan.\n\nDalam mode produksi, ini akan menggunakan WA API Gateway.`);
        window.open(url, '_blank');
        setIsBroadcastModalOpen(false);
    } else {
        alert("Belum ada data pelanggan untuk di-broadcast.");
    }
  };

  const effectiveSearch = searchQuery || localSearch;

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(effectiveSearch.toLowerCase()) || c.id.toLowerCase().includes(effectiveSearch.toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => s.companyName.toLowerCase().includes(effectiveSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white font-serif">Partners & Clients</h2>
          <p className="text-gray-400 text-sm">Manage customer relationships and supplier database.</p>
        </div>
        <div className="flex gap-2">
            {activeTab === 'customers' && (
                <button 
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm font-medium"
                >
                  <MessageCircle size={16} /> Broadcast WA
                </button>
            )}
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-900 transition-colors shadow-lg shadow-brand-red/20 text-sm font-medium"
            >
              <Plus size={16} /> Add {activeTab === 'customers' ? 'Customer' : 'Supplier'}
            </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1e1e1e] p-2 rounded-xl border border-white/5">
        <div className="flex bg-black/40 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'customers' ? 'bg-[#2a2a2a] text-white shadow' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Users size={16} /> Customers
          </button>
          <button 
             onClick={() => setActiveTab('suppliers')}
             className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
               activeTab === 'suppliers' ? 'bg-[#2a2a2a] text-white shadow' : 'text-gray-500 hover:text-white'
             }`}
          >
            <Truck size={16} /> Suppliers
          </button>
        </div>
        
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder={`Cari nama, kode SBR...`} 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-brand-black border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-red"
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'customers' ? (
          // MINIMALIST TABLE LAYOUT FOR CUSTOMERS
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                   <thead className="bg-[#252525] text-white font-medium">
                      <tr>
                         <th className="px-6 py-3">Nama Pelanggan</th>
                         <th className="px-6 py-3">Kontak / Alamat</th>
                         <th className="px-6 py-3 text-right">Total Belanja</th>
                         <th className="px-6 py-3 text-right">Sisa Hutang</th>
                         <th className="px-6 py-3 text-right">Terakhir</th>
                         <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {filteredCustomers.map(customer => (
                         <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3">
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{customer.name}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">({customer.id})</span>
                                  {customer.type === 'Tetap' && (
                                     <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded font-bold">Tetap</span>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-3">
                               <div className="flex flex-col text-xs">
                                  <span className="text-white">{customer.phone || '-'}</span>
                                  <span className="text-gray-500">{customer.address || '-'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-white">
                               Rp {customer.totalSpent.toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-3 text-right font-mono">
                               {customer.outstandingDebt && customer.outstandingDebt > 0 ? (
                                   <span className="text-red-500 font-bold">Rp {customer.outstandingDebt.toLocaleString('id-ID')}</span>
                               ) : (
                                   <span className="text-gray-600">-</span>
                               )}
                            </td>
                            <td className="px-6 py-3 text-right text-xs">
                               {customer.lastVisit}
                            </td>
                            <td className="px-6 py-3 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEdit(customer)} className="text-blue-400 hover:text-white p-1 rounded hover:bg-white/10"><Edit size={14}/></button>
                                  <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:text-white p-1 rounded hover:bg-white/10"><Trash2 size={14}/></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-gray-500">Data pelanggan tidak ditemukan.</div>
             )}
          </div>
        ) : (
          // SUPPLIER GRID (Keep as grid or change if needed, kept as grid for now)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6 group hover:border-blue-500/30 transition-all">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center">
                     <Truck size={20} />
                   </div>
                   <div>
                     <h3 className="text-white font-medium">{supplier.companyName}</h3>
                     <p className="text-xs text-blue-400">{supplier.category}</p>
                   </div>
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(supplier)} className="p-1.5 hover:bg-white/10 rounded text-blue-400"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(supplier.id)} className="p-1.5 hover:bg-white/10 rounded text-red-500"><Trash2 size={16}/></button>
                </div>
               </div>

               <div className="space-y-2 text-sm text-gray-400 mb-4">
                 <div className="flex items-center gap-2 text-white"><UserIcon size={14} className="text-gray-500"/> {supplier.contactPerson}</div>
                 <div className="flex items-center gap-2"><Phone size={14}/> {supplier.phone}</div>
                 <div className="flex items-center gap-2"><Mail size={14}/> {supplier.email}</div>
                 <div className="flex items-center gap-2"><MapPin size={14}/> {supplier.address}</div>
               </div>

               <button 
                onClick={() => handleOpenPO(supplier)}
                className="w-full mt-2 py-2 border border-white/10 hover:bg-white/5 rounded text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
               >
                 <FileText size={14} /> Create Purchase Order
               </button>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                <h3 className="text-xl font-bold text-white">
                  {editingId ? 'Edit' : 'Add New'} {activeTab === 'customers' ? 'Customer' : 'Supplier'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
             </div>
             
             <form onSubmit={handleSave} className="p-6 space-y-4">
               {activeTab === 'customers' ? (
                 <>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                      <input type="text" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Customer Type</label>
                      <select value={customerForm.type} onChange={e => setCustomerForm({...customerForm, type: e.target.value as any})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none">
                        <option value="Umum">Umum (General)</option>
                        <option value="Tetap">Tetap (VIP)</option>
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input type="text" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className={`w-full bg-black/30 border rounded-lg p-2.5 text-white focus:border-brand-red outline-none ${errors.phone ? 'border-red-500' : 'border-white/10'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} className={`w-full bg-black/30 border rounded-lg p-2.5 text-white focus:border-brand-red outline-none ${errors.email ? 'border-red-500' : 'border-white/10'}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
                     </div>
                   </div>
                   {/* ADDED: Total Spent and Last Visit Inputs */}
                   <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-2">
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Total Spent (Rp)</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-2 top-3 text-gray-500" />
                            <input 
                                type="number" 
                                value={customerForm.totalSpent} 
                                onChange={e => setCustomerForm({...customerForm, totalSpent: parseFloat(e.target.value)})} 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 pl-8 text-white focus:border-brand-red outline-none" 
                            />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Last Visit</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-2 top-3 text-gray-500" />
                            <input 
                                type="date" 
                                value={customerForm.lastVisit} 
                                onChange={e => setCustomerForm({...customerForm, lastVisit: e.target.value})} 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 pl-8 text-white focus:border-brand-red outline-none" 
                            />
                        </div>
                     </div>
                   </div>
                 </>
               ) : (
                 <>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                      <input type="text" required value={supplierForm.companyName} onChange={e => setSupplierForm({...supplierForm, companyName: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                        <input type="text" value={supplierForm.category} onChange={e => setSupplierForm({...supplierForm, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Contact Person</label>
                        <input type="text" value={supplierForm.contactPerson} onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input type="text" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} className={`w-full bg-black/30 border rounded-lg p-2.5 text-white focus:border-brand-red outline-none ${errors.phone ? 'border-red-500' : 'border-white/10'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} className={`w-full bg-black/30 border rounded-lg p-2.5 text-white focus:border-brand-red outline-none ${errors.email ? 'border-red-500' : 'border-white/10'}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
                     </div>
                   </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Address</label>
                      <textarea rows={2} value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"></textarea>
                   </div>
                 </>
               )}
               
               <button type="submit" className="w-full py-3 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-4">
                  <Save size={18} /> Save {activeTab === 'customers' ? 'Customer' : 'Supplier'}
               </button>
             </form>
          </div>
        </div>
      )}

      {/* --- PURCHASE ORDER MODAL --- */}
      {isPOModalOpen && selectedSupplierForPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                <div className="flex items-center gap-3">
                    <FileText className="text-brand-gold" size={24} />
                    <div>
                        <h3 className="text-xl font-bold text-white">Create Purchase Order</h3>
                        <p className="text-xs text-gray-400">To: {selectedSupplierForPO.companyName}</p>
                    </div>
                </div>
                <button onClick={() => setIsPOModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
             </div>
             <form onSubmit={handleSendPO} className="p-6 space-y-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-12 gap-2 text-sm text-gray-400 font-medium mb-1">
                        <div className="col-span-5">Item Name</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-4">Unit Price</div>
                        <div className="col-span-1"></div>
                    </div>
                    {poItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                                <input 
                                    type="text" 
                                    placeholder="Item name..."
                                    value={item.name}
                                    onChange={e => updatePoItem(index, 'name', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-brand-red outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <input 
                                    type="number" 
                                    placeholder="Qty"
                                    value={item.qty}
                                    onChange={e => updatePoItem(index, 'qty', parseInt(e.target.value) || 0)}
                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-brand-red outline-none"
                                />
                            </div>
                            <div className="col-span-4">
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        placeholder="Price"
                                        value={item.price}
                                        onChange={e => updatePoItem(index, 'price', parseInt(e.target.value) || 0)}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 pl-7 text-white text-sm focus:border-brand-red outline-none"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button 
                                    type="button"
                                    onClick={() => removePoItem(index)}
                                    className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"
                                >
                                    <Minus size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    type="button" 
                    onClick={addPoItem}
                    className="text-brand-gold text-sm hover:underline flex items-center gap-1"
                >
                    <Plus size={14} /> Add Item Row
                </button>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                    <span className="text-gray-400 text-sm">Total Estimation:</span>
                    <span className="text-white font-bold font-mono">
                        Rp {poItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0).toLocaleString()}
                    </span>
                </div>

                <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-4">
                    <Send size={18} /> Send Detailed PO via WhatsApp
                </button>
             </form>
          </div>
        </div>
      )}

      {/* --- BROADCAST PROMO MODAL --- */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                <div className="flex items-center gap-3">
                    <MessageCircle className="text-green-500" size={24} />
                    <div>
                        <h3 className="text-xl font-bold text-white">Broadcast Promo</h3>
                        <p className="text-xs text-gray-400">Kirim ke {customers.length} Pelanggan</p>
                    </div>
                </div>
                <button onClick={() => setIsBroadcastModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Pesan Promo</label>
                    <textarea 
                        rows={5} 
                        value={broadcastMsg} 
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:border-brand-red outline-none font-sans text-sm"
                    ></textarea>
                </div>
                <button onClick={handleSendBroadcast} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-4">
                    <Send size={18} /> Kirim Broadcast Sekarang
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">Pesan akan dikirim secara otomatis ke nomor WhatsApp pelanggan yang terdaftar.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stakeholders;