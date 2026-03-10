import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ShoppingBag, Heart } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSelect: (role: 'customer' | 'staff') => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        >
          <div className="grid md:grid-cols-2 h-full">
            {/* Left Side: Branding */}
            <div className="bg-brand-red p-4 md:p-8 text-white flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-3 md:mb-6 backdrop-blur-md">
                <ShoppingBag size={24} className="md:w-10 md:h-10" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Selamat Datang!</h2>
              <p className="text-xs md:text-base text-white/80 leading-relaxed max-w-[250px] md:max-w-none">
                Nikmati pengalaman belanja daging sapi terbaik dengan kualitas premium di 
                <span className="font-bold text-white"> Subaru Daging Sapi</span>.
              </p>
              <div className="mt-4 md:mt-8 flex items-center gap-2 text-[10px] md:text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
                <Heart size={12} className="text-white md:w-4 md:h-4" />
                <span>Kualitas Terjamin & Bersertifikat Halal</span>
              </div>
            </div>

            {/* Right Side: Selection */}
            <div className="p-5 md:p-8 flex flex-col justify-center">
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2 text-center md:text-left">
                Masuk Sebagai Apa?
              </h3>
              <p className="text-xs text-gray-500 mb-4 md:mb-8 text-center md:text-left">
                Pilih akses yang sesuai dengan kebutuhan Anda hari ini.
              </p>

              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={() => onSelect('customer')}
                  className="w-full group p-3 md:p-4 border-2 border-gray-100 hover:border-brand-red rounded-2xl flex items-center gap-3 md:gap-4 transition-all hover:shadow-md text-left"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors shrink-0">
                    <ShoppingBag size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm md:text-base text-gray-900">Pelanggan Setia</div>
                    <div className="text-[10px] md:text-xs text-gray-500">Lihat promo, stok, dan belanja online</div>
                  </div>
                </button>

                <button
                  onClick={() => onSelect('staff')}
                  className="w-full group p-3 md:p-4 border-2 border-gray-100 hover:border-brand-red rounded-2xl flex items-center gap-3 md:gap-4 transition-all hover:shadow-md text-left"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors shrink-0">
                    <Users size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm md:text-base text-gray-900">Karyawan / Staff</div>
                    <div className="text-[10px] md:text-xs text-gray-500">Akses sistem internal dan operasional</div>
                  </div>
                </button>
              </div>

              <p className="mt-6 md:mt-8 text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                Subaru Daging Sapi &copy; 2024
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
