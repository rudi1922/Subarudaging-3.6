import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onCareerClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onPrivacyClick, onTermsClick, onCareerClick }) => {
  return (
    <footer className="bg-black py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Left Column - Contact */}
          <div className="flex-1">
            <h4 className="text-white font-serif font-bold text-2xl mb-8">Program Loyalitas & BBB</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Alamat Toko</p>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
                  Jl. Tamin No. 27, Suka Jawa, Kec. Tj. Karang Bar., Kota Bandar Lampung, Lampung 35114
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Hubungi Kami</p>
                <p className="text-gray-500 text-xs">WA Sales: +62 851-6659-9976</p>
                <p className="text-gray-500 text-xs">WA Admin: +62 813-6961-2006</p>
                <p className="text-gray-500 text-xs">Hotline: +62 812-7200-0020</p>
                <p className="text-gray-500 text-xs">ptsubarualammakmur@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Right Column - Socials */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Koneksi Kami</h4>
            <div className="flex gap-4 mb-8">
              <a href="https://web.facebook.com/profile.php?id=61588132628397" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-brand-red hover:border-brand-red transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/subarudagingsapiku/#" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-brand-red hover:border-brand-red transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.youtube.com/@subarudagingsapiku" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-brand-red hover:border-brand-red transition-all">
                <Youtube size={18} />
              </a>
            </div>
            <div className="flex gap-6">
              <button onClick={onPrivacyClick} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Privacy</button>
              <button onClick={onTermsClick} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Terms</button>
              <button onClick={onCareerClick} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Karir</button>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} PT Subaru Alam Makmur. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
