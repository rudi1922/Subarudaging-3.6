import React from 'react';
import { Building, ArrowRight, UserCheck, Target } from 'lucide-react';

interface PartnershipProps {
  onReferralClick: () => void;
}

const Partnership: React.FC<PartnershipProps> = ({ onReferralClick }) => {
  return (
    <section id="partnership" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
       <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red/5 blur-3xl rounded-full translate-x-1/2"></div>
       
       <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Partnership Info */}
              <div className="bg-[#121212] border border-white/5 rounded-3xl p-10 md:p-16 flex flex-col justify-center shadow-2xl">
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Building size={14} /> B2B Solution
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">Partner Bisnis & Horeca</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10">
                      Supply rantai dingin terpercaya untuk Restoran, Hotel, Catering, dan Industri Olahan. 
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                      <a href="https://wa.me/6281369612006" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white text-black rounded-full font-bold text-xs tracking-widest hover:bg-brand-gold transition-colors w-fit flex items-center gap-2">
                          HUBUNGI ADMIN GROSIR <ArrowRight size={14}/>
                      </a>
                      <a href="https://wa.me/6289514077980" target="_blank" rel="noreferrer" className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-xs tracking-widest hover:bg-white/10 transition-colors w-fit flex items-center gap-2">
                          JADWAL KUNJUNGAN SALES <ArrowRight size={14}/>
                      </a>
                  </div>
              </div>

              {/* Referral Section for Employees */}
              <div className="bg-[#121212] border border-white/5 rounded-3xl p-10 md:p-16 flex flex-col justify-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Target size={120} className="text-brand-red" />
                  </div>
                  <span className="text-brand-red text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <UserCheck size={14} /> Referral Karyawan
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">Kirim Penawaran</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10">
                      Punya kenalan calon pembeli? Referensikan mereka di sini untuk mendapatkan reward khusus dari perusahaan.
                  </p>
                  <button onClick={onReferralClick} className="px-8 py-4 bg-brand-red text-white rounded-full font-bold text-xs tracking-widest hover:bg-red-700 transition-colors w-fit shadow-lg shadow-brand-red/20">
                      INPUT REFERRAL
                  </button>
              </div>
          </div>
       </div>
    </section>
  );
};

export default Partnership;
