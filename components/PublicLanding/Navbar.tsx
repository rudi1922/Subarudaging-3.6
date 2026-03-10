import React from 'react';
import { MapPin } from 'lucide-react';
import { AppSettings } from '../../types';

interface NavbarProps {
  scrolled: boolean;
  appSettings: AppSettings;
  customerMode: boolean;
  onLoginClick: () => void;
  onCheckInClick: () => void;
  scrollToSection: (e: React.MouseEvent, id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  scrolled,
  appSettings,
  customerMode,
  onLoginClick,
  onCheckInClick,
  scrollToSection
}) => {
  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-3' : 'bg-black/40 py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => scrollToSection(e, 'home')}>
            {appSettings.logoUrl ? (
                <img src={appSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
                <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center shadow-lg shadow-brand-gold/20">
                  <span className="text-black font-serif font-bold text-xl">S</span>
                </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-widest text-white leading-none">
                SUBARU
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-brand-gold font-bold leading-none mt-1">
                Daging Sapi
              </span>
            </div>
          </div>
          
          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={(e) => scrollToSection(e, 'home')} className="text-[10px] uppercase tracking-widest text-white hover:text-brand-gold transition-colors font-bold">Home</button>
            <button onClick={(e) => scrollToSection(e, 'promo')} className="text-[10px] uppercase tracking-widest text-white hover:text-brand-gold transition-colors font-bold">Katalog</button>
            <button onClick={(e) => scrollToSection(e, 'loyalty')} className="text-[10px] uppercase tracking-widest text-white hover:text-brand-gold transition-colors font-bold">Program</button>
          </div>

          {/* Navigation Buttons - Right */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="px-6 py-2 border border-brand-gold text-brand-gold rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all"
            >
              Login
            </button>
            
            {!customerMode && (
              <button 
                onClick={onCheckInClick}
                className="p-2 text-brand-red hover:text-white transition-colors"
                title="Absensi Staff"
              >
                <MapPin size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
