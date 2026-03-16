import React, { useState } from 'react';
import { MapPin, MessageCircle, Navigation, Target, Plus, Clock, Wallet, Facebook, Instagram, Share2, Edit, Search } from 'lucide-react';
import { useStore } from '../StoreContext';
import { User as UserType, Role, VisitRecord, Lead, Receivable } from '../types';
import MarketAnalysis from './MarketAnalysis';

interface FieldOpsProps {
    user: UserType;
}

const MarketingView = ({ leads, setShowLeadForm, handleCheckIn, searchTerm }: { leads: Lead[], setShowLeadForm: (show: boolean) => void, handleCheckIn: (type: 'Sales Visit' | 'Penagihan', customerName: string) => void, searchTerm: string }) => {
    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Target Card */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target size={120} />
                </div>
                <h3 className="text-white font-bold flex items-center gap-2 mb-4 relative z-10">
                    <Target size={20} className="text-blue-300"/> Target Sales Harian
                </h3>
                <div className="space-y-4 text-center py-6 relative z-10">
                    <p className="text-blue-200 text-sm">Target belum ditentukan untuk hari ini</p>
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-all border border-white/10">
                        Set Target Sekarang
                    </button>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowLeadForm(true)} className="p-5 bg-[#1e1e1e] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-[#252525] hover:border-blue-500/30 transition-all group">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><Plus size={24}/></div>
                    <span className="text-sm font-bold text-white">Input Prospek</span>
                </button>
                <div className="p-5 bg-[#1e1e1e] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-3">
                        <button className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors shadow-lg shadow-blue-600/20"><Facebook size={18}/></button>
                        <button className="p-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl text-white transition-colors shadow-lg shadow-pink-600/20"><Instagram size={18}/></button>
                        <button className="p-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white transition-colors shadow-lg shadow-green-600/20"><Share2 size={18}/></button>
                    </div>
                    <span className="text-sm font-bold text-white">Share Promo</span>
                </div>
            </div>

            {/* Leads List */}
            <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-[#252525] border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm">Daftar Prospek Terbaru</h3>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{filteredLeads.length} Prospek</span>
                </div>
                <div className="divide-y divide-white/5">
                    {filteredLeads.slice(0, 10).map(lead => (
                        <div key={lead.id} className="p-4 flex justify-between items-start hover:bg-white/5 transition-colors">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-white font-bold text-sm truncate">{lead.name}</h4>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 truncate"><MapPin size={10}/> {lead.location}</p>
                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 italic">"{lead.notes}"</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end ml-4">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${lead.status === 'Baru' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{lead.status}</span>
                                <div className="flex gap-1.5">
                                    <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="p-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded-lg transition-colors"><MessageCircle size={14}/></button>
                                    <button onClick={() => handleCheckIn('Sales Visit', lead.name)} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"><MapPin size={14}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredLeads.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-gray-500 text-sm">Tidak ada prospek ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CollectionView = ({ receivables, handleCheckIn, setCollectionAction, user, searchTerm }: { receivables: Receivable[], handleCheckIn: (type: 'Sales Visit' | 'Penagihan', customerName: string) => void, setCollectionAction: (action: { rec: Receivable, action: 'janji' | 'bayar' | 'visit' } | null) => void, user: UserType, searchTerm: string }) => {
    const { visitRecords, collectionTarget, setCollectionTarget } = useStore();
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [newTarget, setNewTarget] = useState(collectionTarget);

    // Filter overdue receivables
    const overdue = receivables.filter(r => 
        r.status !== 'Lunas' && 
        (r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || r.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Calculate achieved amount from visit records (today's collections)
    const today = new Date().toISOString().split('T')[0];
    const achievedAmount = visitRecords
        .filter(v => v.type === 'Penagihan' && v.amountCollected && v.timestamp.startsWith(today))
        .reduce((sum, v) => sum + (v.amountCollected || 0), 0);

    const percentage = Math.min(100, Math.round((achievedAmount / collectionTarget) * 100));

    const handleSaveTarget = () => {
        setCollectionTarget(newTarget);
        setIsEditingTarget(false);
    };
    
    return (
        <div className="space-y-6">
            {/* Target Card */}
            <div className="bg-gradient-to-br from-red-900 via-red-800 to-rose-900 p-6 rounded-2xl border border-white/10 shadow-xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} />
                </div>
                {(user.role === Role.ADMIN || user.role === Role.MANAGER || user.role === Role.DIRECTOR) && (
                    <button 
                        onClick={() => setIsEditingTarget(true)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        title="Edit Target"
                    >
                        <Edit size={16} />
                    </button>
                )}
                
                <h3 className="text-white font-bold flex items-center gap-2 mb-4 relative z-10"><Wallet size={20} className="text-red-300"/> Target Penagihan</h3>
                <div className="flex justify-between items-end mb-3 relative z-10">
                    <span className="text-3xl font-mono font-bold text-white">Rp {achievedAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-red-200 mb-1 uppercase tracking-widest font-bold">Target: Rp {collectionTarget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-red-950/50 h-3 rounded-full overflow-hidden relative z-10 border border-white/5">
                    <div className="bg-gradient-to-r from-red-400 to-rose-300 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(248,113,113,0.5)]" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-[10px] text-red-200 mt-2 text-right font-bold relative z-10">{percentage}% Tercapai</p>
            </div>

            {/* Edit Target Modal */}
            {isEditingTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e1e1e] w-full max-sm rounded-2xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-white font-bold text-lg mb-4">Set Target Penagihan</h3>
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                            <input 
                                type="number" 
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-2xl font-mono font-bold focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                                value={newTarget}
                                onChange={e => setNewTarget(Number(e.target.value))}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditingTarget(false)} className="flex-1 py-3 bg-[#2a2a2a] text-white rounded-xl font-bold hover:bg-[#333] transition-colors">Batal</button>
                            <button onClick={handleSaveTarget} className="flex-1 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-brand-red/20">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Priority List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest text-gray-400">Prioritas Penagihan</h3>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{overdue.length} Outstanding</span>
                </div>
                <div className="grid gap-4">
                    {overdue.map(rec => (
                        <div key={rec.id} className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-red-500/20 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-white font-bold text-base truncate group-hover:text-red-400 transition-colors">{rec.customerName}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-wider">INVOICE: {rec.invoiceId}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-red-400 font-bold font-mono text-lg">Rp {rec.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-red-500/80 mt-1 font-bold flex items-center justify-end gap-1 uppercase tracking-tighter">
                                        <Clock size={10}/> Jatuh Tempo: {rec.dueDate}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button 
                                    onClick={() => window.open(`https://wa.me/${rec.phone}`, '_blank')}
                                    className="flex-1 py-2.5 bg-green-600/10 text-green-500 hover:bg-green-600/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-green-600/20 transition-all"
                                >
                                    <MessageCircle size={14}/> WA
                                </button>
                                <button 
                                    onClick={() => handleCheckIn('Penagihan', rec.customerName)}
                                    className="flex-1 py-2.5 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-all"
                                >
                                    <Navigation size={14}/> Visit
                                </button>
                                <button 
                                    onClick={() => setCollectionAction({ rec, action: 'bayar' })}
                                    className="flex-1 py-2.5 bg-brand-gold text-black hover:bg-yellow-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-gold/10"
                                >
                                    <Wallet size={14}/> Bayar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {overdue.length === 0 && (
                    <div className="p-12 text-center bg-[#1e1e1e] rounded-2xl border border-dashed border-white/10">
                        <Wallet size={40} className="mx-auto text-gray-700 mb-3" />
                        <p className="text-gray-500 text-sm">Tidak ada tagihan outstanding saat ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FieldOps: React.FC<FieldOpsProps> = ({ user }) => {
    const { receivables, visitRecords, leads, addVisitRecord, addLead, payReceivable, addSystemLog, showToast } = useStore();
    const [activeTab, setActiveTab] = useState<'marketing' | 'collection'>(user.role === Role.DEBT_COLLECTOR ? 'collection' : 'marketing');
    const [searchTerm, setSearchTerm] = useState('');
    
    // -- MARKETING STATE --
    const [newLead, setNewLead] = useState<Partial<Lead>>({ name: '', phone: '', location: '', status: 'Baru', notes: '' });
    const [showLeadForm, setShowLeadForm] = useState(false);

    // -- COLLECTION STATE --
    const [collectionAction, setCollectionAction] = useState<{ rec: Receivable, action: 'janji' | 'bayar' | 'visit' } | null>(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [notes, setNotes] = useState('');

    // -- SHARED STATE --
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    // -- MOCK GPS CHECKIN --
    const handleCheckIn = (type: 'Sales Visit' | 'Penagihan', customerName: string) => {
        setIsCheckingIn(true);
        setTimeout(() => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const loc = `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                    const newRecord: VisitRecord = {
                        id: `v-${Date.now()}`,
                        userId: user.id,
                        userName: user.name,
                        role: user.role,
                        customerName: customerName,
                        location: loc,
                        timestamp: new Date().toISOString(),
                        type: type,
                        outcome: 'Check-In Lokasi'
                    };
                    addVisitRecord(newRecord);
                    addSystemLog({
                        id: `log-${Date.now()}`,
                        userId: user.id,
                        userName: user.name,
                        role: user.role,
                        action: 'ACTION',
                        details: `Check-In Lapangan (${type}): ${customerName} @ ${loc}`,
                        timestamp: new Date().toISOString(),
                        ip: 'Mobile',
                        location: loc,
                        device: 'Mobile'
                    });
                    setIsCheckingIn(false);
                    showToast(`Berhasil Check-In di ${loc}`, 'success');
                }, () => {
                    // Fallback
                    const newRecord: VisitRecord = {
                        id: `v-${Date.now()}`,
                        userId: user.id,
                        userName: user.name,
                        role: user.role,
                        customerName: customerName,
                        location: 'Manual Location (GPS Error)',
                        timestamp: new Date().toISOString(),
                        type: type,
                        outcome: 'Check-In Lokasi'
                    };
                    addVisitRecord(newRecord);
                    setIsCheckingIn(false);
                    showToast('Check-In Manual Berhasil (GPS Gagal)', 'warning');
                });
            }
        }, 1000);
    };

    // -- MARKETING HANDLERS --
    const handleAddLead = (e: React.FormEvent) => {
        e.preventDefault();
        addLead({
            ...newLead as Lead,
            id: `lead-${Date.now()}`,
            dateAdded: new Date().toISOString().split('T')[0],
            salesId: user.id
        });
        
        addSystemLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            role: user.role,
            action: 'ACTION',
            details: `Input Prospek Baru: ${newLead.name}`,
            timestamp: new Date().toISOString(),
            ip: 'Mobile',
            location: 'FieldOps',
            device: 'Mobile'
        });

        setShowLeadForm(false);
        setNewLead({ name: '', phone: '', location: '', status: 'Baru', notes: '' });
    };

    // -- COLLECTION HANDLERS --
    const handleCollectionSubmit = () => {
        if (!collectionAction) return;

        if (collectionAction.action === 'bayar') {
            if (paymentAmount <= 0) return showToast('Masukkan nominal bayar', 'error');
            payReceivable(collectionAction.rec.id, paymentAmount);
            addVisitRecord({
                id: `v-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                customerName: collectionAction.rec.customerName,
                location: 'Lokasi Pelanggan',
                timestamp: new Date().toISOString(),
                type: 'Penagihan',
                outcome: `Bayar Rp ${paymentAmount.toLocaleString()}`,
                amountCollected: paymentAmount
            });
            
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Terima Pembayaran Piutang: ${collectionAction.rec.customerName} - Rp ${paymentAmount.toLocaleString()}`,
                timestamp: new Date().toISOString(),
                ip: 'Mobile',
                location: 'FieldOps',
                device: 'Mobile'
            });

        } else {
            addVisitRecord({
                id: `v-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                customerName: collectionAction.rec.customerName,
                location: 'Lokasi Pelanggan',
                timestamp: new Date().toISOString(),
                type: 'Penagihan',
                outcome: `Kunjungan: ${notes}`
            });
            
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'ACTION',
                details: `Kunjungan Penagihan: ${collectionAction.rec.customerName} - ${notes}`,
                timestamp: new Date().toISOString(),
                ip: 'Mobile',
                location: 'FieldOps',
                device: 'Mobile'
            });
        }
        setCollectionAction(null);
        setPaymentAmount(0);
        setNotes('');
        showToast('Aktivitas Penagihan Tercatat', 'success');
    };

    // --- RENDERERS ---



    return (
        <div className="pb-24 max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pt-4">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif tracking-tight">{user.role === Role.SALES ? 'Sales & Marketing' : 'Debt Collection'}</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">Field Operations Dashboard</p>
                </div>
                <div className="text-right">
                    <p className="text-white font-bold text-sm">{user.name}</p>
                    <p className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
                        ONLINE
                    </p>
                </div>
            </div>

            {/* Global Search Bar for FieldOps */}
            <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-gray-500 group-focus-within:text-brand-red transition-colors" size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder={activeTab === 'marketing' ? "Cari prospek atau lokasi..." : "Cari tagihan atau nama customer..."}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Admin Switcher */}
            {(user.role === Role.ADMIN || user.role === Role.MANAGER || user.role === Role.DIRECTOR) && (
                <div className="flex bg-[#1e1e1e] p-1.5 rounded-2xl mb-8 border border-white/5 shadow-inner">
                    <button onClick={() => {setActiveTab('marketing'); setSearchTerm('');}} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'marketing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}>Marketing View</button>
                    <button onClick={() => {setActiveTab('collection'); setSearchTerm('');}} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'collection' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-gray-300'}`}>Collection View</button>
                </div>
            )}

            {/* Main Content */}
            {activeTab === 'marketing' ? (
                <MarketingView leads={leads} setShowLeadForm={setShowLeadForm} handleCheckIn={handleCheckIn} searchTerm={searchTerm} />
            ) : (
                <CollectionView receivables={receivables} handleCheckIn={handleCheckIn} setCollectionAction={setCollectionAction} user={user} searchTerm={searchTerm} />
            )}

            {/* --- MODALS --- */}
            
            {/* 1. Lead Form Modal */}
            {showLeadForm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
                    <div className="bg-[#1e1e1e] w-full max-w-md rounded-t-2xl sm:rounded-xl border border-white/10 p-6 animate-in slide-in-from-bottom-10">
                        <h3 className="text-white font-bold text-lg mb-4">Input Prospek Baru</h3>
                        <form onSubmit={handleAddLead} className="space-y-4">
                            <input type="text" placeholder="Nama Calon Customer" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required/>
                            <input type="text" placeholder="Nomor WhatsApp" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} required/>
                            <input type="text" placeholder="Nama Lokasi / Alamat" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" value={newLead.location} onChange={e => setNewLead({...newLead, location: e.target.value})} required/>
                            <textarea placeholder="Catatan Kebutuhan..." className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" rows={3} value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})}></textarea>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowLeadForm(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-bold">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Collection Action Modal */}
            {collectionAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                        <h3 className="text-white font-bold text-lg mb-2">
                            {collectionAction.action === 'bayar' ? 'Input Pembayaran' : 'Catat Aktivitas'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">{collectionAction.rec.customerName} - Inv: {collectionAction.rec.invoiceId}</p>
                        
                        <div className="space-y-4">
                            {collectionAction.action === 'bayar' && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Nominal Diterima</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-lg font-mono font-bold"
                                        placeholder="0"
                                        value={paymentAmount || ''}
                                        onChange={e => setPaymentAmount(Number(e.target.value))}
                                        autoFocus
                                    />
                                    <p className="text-xs text-red-400 mt-1">Sisa Hutang: Rp {collectionAction.rec.amount.toLocaleString()}</p>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Catatan / Bukti</label>
                                <textarea 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                                    rows={3}
                                    placeholder={collectionAction.action === 'bayar' ? 'Keterangan pelunasan...' : 'Hasil kunjungan...'}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setCollectionAction(null)} className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-bold">Batal</button>
                                <button onClick={handleCollectionSubmit} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Check-In Overlay */}
            {isCheckingIn && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur text-white">
                    <div className="w-16 h-16 border-4 border-t-brand-red border-white/10 rounded-full animate-spin mb-4"></div>
                    <p className="animate-pulse">Mengambil Lokasi GPS...</p>
                </div>
            )}

            {/* Visit Log Report (Mini) */}
            <div className="mt-8">
                <h3 className="text-white font-bold text-sm mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Clock size={16}/> Riwayat Kunjungan Hari Ini
                </h3>
                <div className="space-y-3">
                    {visitRecords.filter(v => v.userId === user.id).slice(0, 5).map(visit => (
                        <div key={visit.id} className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg">
                            <div>
                                <span className="text-white font-bold">{visit.customerName}</span>
                                <p className="text-[10px] text-gray-400">{visit.location}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-300">{visit.outcome}</p>
                                <p className="text-[10px] text-brand-gold">{new Date(visit.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    {visitRecords.filter(v => v.userId === user.id).length === 0 && <p className="text-xs text-gray-500 italic">Belum ada aktivitas hari ini.</p>}
                </div>
            </div>

            {/* Market Analysis Section */}
            <div className="mt-8 pt-8 border-t border-white/10">
                <MarketAnalysis />
            </div>
        </div>
    );
};

export default FieldOps;