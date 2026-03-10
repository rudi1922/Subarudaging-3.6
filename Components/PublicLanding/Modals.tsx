import React from 'react';
import { X as XIcon, BadgeCheck, Loader2, CheckCircle, UserCheck, Building } from 'lucide-react';
import { Employee, GalleryItem } from '../../types';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
  isSubmitting: boolean;
  selectedArticle: GalleryItem | null;
  employees: Employee[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  checkInType: 'Masuk' | 'Pulang';
  setCheckInType: (type: 'Masuk' | 'Pulang') => void;
  handleCheckInSubmit: (e: React.FormEvent) => void;
  referralData: { name: string; phone: string; interest: string; notes: string };
  setReferralData: (data: any) => void;
  handleReferralSubmit: (e: React.FormEvent) => void;
  onLoyaltySubmit: () => void;
}

const LOYALTY_PROGRAMS = [
    { id: 'lp1', title: 'Paket 300', description: 'Target 300kg dalam 6 bulan', targetKg: 300, durationMonths: 6, reward: 'Rp 300.000', isActive: true },
    { id: 'lp2', title: 'Paket 600', description: 'Target 600kg dalam 6 bulan', targetKg: 600, durationMonths: 6, reward: 'Rp 600.000', isActive: true },
    { id: 'lp3', title: 'Paket 720', description: 'Target 720kg dalam 6 bulan', targetKg: 720, durationMonths: 6, reward: 'Rp 720.000', isActive: true },
    { id: 'lp4', title: 'Paket 900', description: 'Target 900kg dalam 6 bulan', targetKg: 900, durationMonths: 6, reward: 'Rp 900.000', isActive: true },
    { id: 'lp5', title: 'Paket 1200', description: 'Target 1200kg dalam 6 bulan', targetKg: 1200, durationMonths: 6, reward: 'Rp 1.200.000', isActive: true },
];

const Modals: React.FC<ModalsProps> = ({
  activeModal,
  onClose,
  isSubmitting,
  selectedArticle,
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  checkInType,
  setCheckInType,
  handleCheckInSubmit,
  referralData,
  setReferralData,
  handleReferralSubmit,
  onLoyaltySubmit
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-6 animate-in fade-in duration-300">
        <div className="bg-[#121212] w-full max-w-sm rounded-2xl border border-white/10 p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"><XIcon size={20}/></button>
             
             {activeModal === 'loyalty' ? (
                   <div className="text-center">
                       <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                           <BadgeCheck size={32} />
                       </div>
                       <h3 className="text-2xl font-serif font-bold text-white mb-2">Pendaftaran Program</h3>
                       <p className="text-gray-400 text-xs mb-8">Silakan lengkapi data Anda untuk bergabung dalam program loyalitas kami.</p>
                       
                       <form className="space-y-4 text-left">
                           <div>
                               <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap / Toko</label>
                               <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors" placeholder="Contoh: Budi Santoso / Toko Berkah" />
                           </div>
                           <div>
                               <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nomor WhatsApp</label>
                               <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors" placeholder="0812..." />
                           </div>
                           <div className="pt-4">
                               <button 
                                 type="button"
                                 onClick={onLoyaltySubmit}
                                 className="w-full py-4 bg-brand-gold text-black font-bold rounded-lg text-xs tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                               >
                                   {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'KIRIM PENDAFTARAN'}
                               </button>
                           </div>
                       </form>
                   </div>
                ) : activeModal === 'loyalty_programs' ? (
                    <div className="text-left">
                        <h3 className="text-2xl font-serif font-bold text-white mb-6 uppercase tracking-widest text-center">Program Loyalitas</h3>
                        <div className="space-y-4 mb-8">
                            {LOYALTY_PROGRAMS.map(prog => (
                                <div key={prog.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-brand-gold/50 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm">{prog.title}</h4>
                                        <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded font-bold">{prog.reward}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs leading-relaxed">{prog.description}</p>
                                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Target: {prog.targetKg}kg</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Durasi: {prog.durationMonths} Bln</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] text-gray-500 italic text-center mb-4">* Syarat & Ketentuan berlaku. Reward diberikan setelah target tercapai.</p>
                            <button 
                                onClick={() => onLoyaltySubmit()}
                                className="w-full py-4 bg-brand-gold text-black font-bold rounded-lg text-xs tracking-widest hover:bg-yellow-500 transition-colors uppercase"
                            >
                                Daftar Sekarang
                            </button>
                            <button onClick={onClose} className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-xs tracking-widest hover:bg-white/10 transition-colors uppercase">Tutup</button>
                        </div>
                    </div>
                ) : activeModal === 'b2b' ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                            <Building size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2">Penawaran B2B</h3>
                        <p className="text-gray-400 text-xs mb-8">Silakan isi data bisnis Anda untuk mendapatkan penawaran harga khusus Horeca & Industri.</p>
                        <form className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Perusahaan / Resto</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors" placeholder="Contoh: Resto Sedap Malam" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">WhatsApp PIC</label>
                                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors" placeholder="0812..." />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Kebutuhan Produk</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors h-24 resize-none" placeholder="Contoh: 100kg Sirloin / minggu"></textarea>
                            </div>
                            <div className="pt-4">
                                <button 
                                  type="button"
                                  onClick={onLoyaltySubmit}
                                  className="w-full py-4 bg-brand-gold text-black font-bold rounded-lg text-xs tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'KIRIM PENAWARAN'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : activeModal === 'article' && selectedArticle ? (
                    <div className="text-left max-h-[80vh] overflow-y-auto pr-2">
                        <img src={selectedArticle.imageUrl} className="w-full h-64 object-cover rounded-xl mb-6" alt={selectedArticle.title} />
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{selectedArticle.category || 'Berita'}</span>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest">{selectedArticle.date}</span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4">{selectedArticle.title}</h3>
                        <div className="text-sm text-gray-400 space-y-4 leading-relaxed whitespace-pre-wrap">
                            {selectedArticle.content || 'Konten artikel belum tersedia.'}
                        </div>
                        <button onClick={onClose} className="w-full py-3 mt-8 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-xs tracking-widest hover:bg-white/10 transition-colors uppercase">Tutup</button>
                    </div>
                ) : activeModal === 'success' ? (
                   <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                          <CheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-white mb-2">Berhasil</h3>
                      <p className="text-gray-400 text-xs mb-6">Data Anda telah kami terima dan tercatat di sistem.</p>
                      <button onClick={onClose} className="w-full py-3 bg-white text-black font-bold rounded-lg text-xs tracking-widest hover:bg-gray-200 uppercase">Tutup</button>
                   </div>
               ) : activeModal === 'checkin' ? (
                   <div className="text-center">
                       <h3 className="text-xl font-serif font-bold text-white mb-2">Check-In Karyawan</h3>
                       <p className="text-gray-400 text-xs mb-6">Pilih nama Anda untuk melakukan absensi harian.</p>
                       
                       <form onSubmit={handleCheckInSubmit} className="space-y-4">
                           <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                               <button
                                   type="button"
                                   onClick={() => setCheckInType('Masuk')}
                                   className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${checkInType === 'Masuk' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                               >
                                   MASUK KERJA
                               </button>
                               <button
                                   type="button"
                                   onClick={() => setCheckInType('Pulang')}
                                   className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${checkInType === 'Pulang' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                               >
                                   PULANG KERJA
                               </button>
                           </div>

                           <select 
                             value={selectedEmployeeId}
                             onChange={(e) => setSelectedEmployeeId(e.target.value)}
                             className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-red outline-none"
                           >
                               <option value="">-- Pilih Nama --</option>
                               {(employees || []).slice().sort((a,b) => (a.name || '').localeCompare(b.name || '')).map(emp => (
                                   <option key={emp.id} value={emp.id}>{emp.name} ({emp.division})</option>
                               ))}
                           </select>
                           
                           <button 
                             type="submit" 
                             disabled={isSubmitting}
                             className="w-full py-4 bg-brand-red text-white font-bold rounded-lg text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                           >
                               {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={16} />}
                               {isSubmitting ? 'Memproses...' : 'Konfirmasi Hadir'}
                           </button>
                       </form>
                   </div>
               ) : activeModal === 'referral' ? (
                 <div className="text-center">
                     <h3 className="text-xl font-serif font-bold text-white mb-2">Input Referral</h3>
                     <p className="text-gray-400 text-xs mb-6">Referensikan calon pembeli sapi/daging.</p>
                     
                     <form onSubmit={handleReferralSubmit} className="space-y-4 text-left">
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Nama Calon Pembeli</label>
                             <input 
                                 type="text" 
                                 required
                                 value={referralData.name}
                                 onChange={(e) => setReferralData({...referralData, name: e.target.value})}
                                 className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-red outline-none" 
                                 placeholder="Nama Lengkap" 
                             />
                         </div>
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">No. WhatsApp</label>
                             <input 
                                 type="text" 
                                 required
                                 value={referralData.phone}
                                 onChange={(e) => setReferralData({...referralData, phone: e.target.value})}
                                 className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-red outline-none" 
                                 placeholder="0812..." 
                             />
                         </div>
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Minat Produk</label>
                             <select 
                                 value={referralData.interest}
                                 onChange={(e) => setReferralData({...referralData, interest: e.target.value})}
                                 className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-red outline-none"
                             >
                                 <option value="">Pilih Minat</option>
                                 <option value="Sapi Hidup">Sapi Hidup</option>
                                 <option value="Daging Karkas">Daging Karkas</option>
                                 <option value="Daging Box/Premium">Daging Box/Premium</option>
                                 <option value="Jasa RPH">Jasa RPH</option>
                             </select>
                         </div>
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Catatan Tambahan</label>
                             <textarea 
                                 value={referralData.notes}
                                 onChange={(e) => setReferralData({...referralData, notes: e.target.value})}
                                 className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-red outline-none h-20 resize-none" 
                                 placeholder="Keterangan tambahan..."
                             ></textarea>
                         </div>
                         <button 
                             type="submit" 
                             disabled={isSubmitting}
                             className="w-full py-4 bg-brand-red text-white font-bold rounded-lg text-xs tracking-widest uppercase flex items-center justify-center gap-2 mt-4"
                         >
                             {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'KIRIM DATA'}
                         </button>
                     </form>
                 </div>
               ) : (
                   <div className="text-center">
                       <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-widest">{activeModal}</h3>
                       <p className="text-gray-400 text-sm mb-8">Informasi ini sedang dalam pemeliharaan atau akan segera hadir.</p>
                       <button onClick={onClose} className="w-full py-3 bg-white text-black font-bold rounded-lg text-xs tracking-widest hover:bg-gray-200 uppercase">Tutup</button>
                   </div>
               )}
        </div>
    </div>
  );
};

export default Modals;
