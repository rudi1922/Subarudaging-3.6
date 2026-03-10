import React from 'react';
import { BadgeCheck, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LoyaltyProps {
  onJoinClick: () => void;
  onReferralClick: () => void;
}

const Loyalty: React.FC<LoyaltyProps> = ({ onJoinClick, onReferralClick }) => {
  return (
    <section id="loyalty" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-6">Program Loyalitas & Refereal</h2>
            <h3 className="text-5xl md:text-6xl font-serif font-bold text-black mb-8 uppercase tracking-tighter">DAGING SAPI</h3>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-xl">
              Bergabunglah dengan program loyalitas kami dan nikmati berbagai keuntungan eksklusif. 
              Dapatkan poin setiap transaksi dan tukarkan dengan hadiah menarik. 
              Gunakan sistem referral kami untuk mendapatkan komisi tambahan.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onJoinClick}
                className="px-10 py-4 bg-brand-red text-white font-bold text-xs tracking-widest hover:bg-red-700 transition-all uppercase"
              >
                PESAN SEKARANG
              </button>
              <button 
                onClick={onReferralClick}
                className="px-10 py-4 border border-black text-black font-bold text-xs tracking-widest hover:bg-black hover:text-white transition-all uppercase"
              >
                LIHAT PROGRAM
              </button>
            </div>
          </div>

          {/* Cards Visual */}
          <div className="flex-1 relative h-[400px] w-full max-w-md">
            <motion.div 
              initial={{ rotate: -5, x: 0 }}
              whileInView={{ rotate: -10, x: -20 }}
              className="absolute top-10 left-0 w-full aspect-[1.6/1] bg-gradient-to-br from-[#1a1a1a] to-black rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BadgeCheck size={120} className="text-brand-gold" />
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-gold rounded flex items-center justify-center text-black font-bold">S</div>
                 <span className="text-white font-bold tracking-widest text-xs uppercase">SUBARU</span>
               </div>
               <div>
                 <p className="text-brand-gold text-[10px] uppercase tracking-widest mb-1">Loyalty Member</p>
                 <p className="text-white font-mono tracking-widest">**** **** **** 2024</p>
               </div>
            </motion.div>

            <motion.div 
              initial={{ rotate: 5, x: 0 }}
              whileInView={{ rotate: 5, x: 20 }}
              className="absolute top-20 left-10 w-full aspect-[1.6/1] bg-gradient-to-br from-brand-red to-[#800000] rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Share2 size={120} className="text-white" />
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-brand-red font-bold">S</div>
                 <span className="text-white font-bold tracking-widest text-xs uppercase">SUBARU</span>
               </div>
               <div>
                 <p className="text-white/70 text-[10px] uppercase tracking-widest mb-1">Referral Partner</p>
                 <p className="text-white font-mono tracking-widest">REF-SUB-9976</p>
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loyalty;
