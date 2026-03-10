import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppSettings } from '../../types';

interface HeroProps {
  appSettings: AppSettings;
  scrollToSection: (e: React.MouseEvent, id: string) => void;
}

const Hero: React.FC<HeroProps> = ({
  appSettings,
  scrollToSection
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2500&auto=format&fit=crop";
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={appSettings.heroImageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2500&auto=format&fit=crop"} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[scale_40s_ease-in-out_infinite]"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-left px-6 max-w-7xl mx-auto w-full flex flex-col items-start justify-center h-full">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight uppercase tracking-tight"
        >
          KEUNGGULAN KAMI<br/>
          <span className="text-white">DAGING SAPI</span>
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-8"
        >
          <button 
            onClick={(e) => scrollToSection(e, 'promo')}
            className="px-10 py-4 bg-brand-gold text-black font-bold text-xs tracking-[0.2em] hover:bg-yellow-500 transition-all shadow-xl uppercase"
          >
            PESAN SEKARANG
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </section>
  );
};

export default Hero;
