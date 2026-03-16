import React, { useState, useEffect } from 'react';
import { ChevronDown, Wallet, BadgeCheck, Mail, Phone, Building, X as XIcon, MessageCircle, Send, Video, Facebook, Youtube, Instagram, ShoppingCart, CheckCircle, Loader2, Globe, ArrowRight, Star, Clock, ShoppingBag, UserCheck, Target, MapPin, ArrowUp } from 'lucide-react';
import { useStore } from '../StoreContext';
import { Role, Product, ProductCategory } from '../types';
import { calculateDistance } from '../utils/location';

// Coordinates
const LOCATIONS = [
    { name: 'Kantor Admin', lat: -5.4144, lng: 105.2632 },
    { name: 'RPH Subaru', lat: -5.3587, lng: 105.3181 },
    { name: 'Subaru Tamin', lat: -5.4187, lng: 105.2483 },
    { name: 'Subaru Way Halim', lat: -5.3881, lng: 105.2714 }
];
const MAX_RADIUS_METERS = 5; // 5 meters tolerance as requested

interface PublicLandingProps {
  onLoginClick: () => void;
  onPelangganClick: () => void;
}

const PublicLanding: React.FC<PublicLandingProps> = ({ onLoginClick, onPelangganClick }) => {
  const { employees, checkInEmployee, addLead, addSystemLog, appSettings, products, customerMode, setCustomerMode, galleryItems, showToast } = useStore();
  const [activeModal, setActiveModal] = useState<'order' | 'sales' | 'offer' | 'success' | 'checkin' | 'referral' | 'privacy' | 'terms' | 'career' | 'loyalty' | 'article' | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [checkInType, setCheckInType] = useState<'Masuk' | 'Pulang'>('Masuk'); // Added CheckIn Type
  const [referralData, setReferralData] = useState({ name: '', phone: '', interest: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseModal = () => setActiveModal(null);
  
  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return showToast('Pilih nama Anda', 'error');
    
    const emp = (employees || []).find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    setIsSubmitting(true);
    
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            
            // Check distance to any valid location
            let isWithinRange = false;
            let nearestLocation = '';
            let minDistance = Infinity;

            for (const loc of LOCATIONS) {
                const dist = calculateDistance(userLat, userLng, loc.lat, loc.lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestLocation = loc.name;
                }
                if (dist <= MAX_RADIUS_METERS) {
                    isWithinRange = true;
                    break;
                }
            }

            if (!isWithinRange) {
                showToast(`Anda berada di luar radius kantor/gerai! Jarak terdekat: ${Math.round(minDistance)}m. Maksimal: ${MAX_RADIUS_METERS}m.`, 'error');
                setIsSubmitting(false);
                return;
            }
            
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Logic for Check In vs Check Out
            const status = checkInType === 'Masuk' ? (time > '08:15' ? 'Terlambat' : 'Hadir') : 'Pulang';
            
            checkInEmployee(selectedEmployeeId, status, time);
            
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: emp.id,
                userName: emp.name,
                role: Role.PUBLIC,
                action: 'ACTION',
                details: `Absensi ${checkInType}: ${emp.name} di ${nearestLocation} (${Math.round(minDistance)}m)`,
                timestamp: new Date().toISOString(),
                ip: 'Public Portal',
                location: `${userLat}, ${userLng}`,
                device: navigator.userAgent
            });

            setIsSubmitting(false);
            setActiveModal('success');

        }, () => {
            showToast("Gagal mendapatkan lokasi GPS. Pastikan GPS aktif.", 'error');
            setIsSubmitting(false);
        });
    } else {
        showToast("Browser tidak mendukung Geolocation.", 'error');
        setIsSubmitting(false);
    }
  };

  // ... (rest of handlers)

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addLead({
        id: `lead-${Date.now()}`,
        name: referralData.name,
        phone: referralData.phone,
        interest: referralData.interest,
        notes: `Referral: ${referralData.interest}. ${referralData.notes}`,
        dateAdded: new Date().toISOString().split('T')[0],
        salesId: 'system'
    });

    setTimeout(() => {
        setIsSubmitting(false);
        setReferralData({ name: '', phone: '', interest: '', notes: '' });
        setActiveModal('success');
    }, 1000);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/800x600/1a1a1a/FFF?text=Subaru+Daging";
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center">
        <div className="relative mb-8">
           <div className="w-24 h-24 border border-black/5 rounded-full absolute animate-ping opacity-20"></div>
           <div className="w-24 h-24 border-t-2 border-brand-red rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brand-red font-serif font-bold text-4xl">S</span>
           </div>
        </div>
        <div className="text-center space-y-3 animate-pulse">
           <h1 className="text-xl font-serif font-bold text-black tracking-[0.5em] pl-2">SUBARU</h1>
           <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">Premium Beef Selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-brand-gold selection:text-black overflow-x-hidden">
      
      {/* --- NAVIGATION (MINIMALIST) --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-black/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => scrollToSection(e, 'home')}>
              {appSettings.logoUrl ? (
                  <img src={appSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-black/5 p-1" />
              ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-[#4a0000] rounded-lg flex items-center justify-center shadow-lg shadow-brand-red/20 group-hover:rotate-45 transition-transform duration-500 ease-out">
                    <span className="text-white font-serif font-bold text-xl">S</span>
                  </div>
              )}
              <div className="flex flex-col">
                <span className={`font-serif text-xl font-bold tracking-widest leading-none transition-colors ${scrolled ? 'text-black' : 'text-white'}`}>
                  SUBARU
                </span>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold leading-none mt-1 transition-colors ${scrolled ? 'text-brand-red' : 'text-brand-gold'}`}>
                  Daging Sapi
                </span>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              {/* Mode Selector - Always Visible */}
              <div className={`hidden sm:flex p-1 rounded-full border transition-all ${scrolled ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
                <button 
                  onClick={() => {
                    setCustomerMode(true);
                    onPelangganClick();
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${customerMode ? 'bg-brand-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Pelanggan
                </button>
                {!customerMode && (
                  <button 
                    onClick={() => {
                      setCustomerMode(false);
                      onLoginClick();
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!customerMode ? 'bg-brand-red text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    Staff
                  </button>
                )}
              </div>

              {/* Mobile Mode Icons */}
              <div className="flex sm:hidden gap-2">
                <button 
                  onClick={() => {
                    setCustomerMode(true);
                    onPelangganClick();
                  }}
                  className={`p-2 rounded-lg border transition-all ${customerMode ? 'bg-brand-gold border-brand-gold text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  <ShoppingBag size={18} />
                </button>
                {!customerMode && (
                  <button 
                    onClick={() => {
                      setCustomerMode(false);
                      onLoginClick();
                    }}
                    className={`p-2 rounded-lg border transition-all ${!customerMode ? 'bg-brand-red border-brand-red text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                  >
                    <UserCheck size={18} />
                  </button>
                )}
              </div>

              {!customerMode && (
                <button 
                  onClick={() => setActiveModal('checkin')}
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

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 p-3 bg-brand-gold text-black rounded-full shadow-lg transition-all duration-300 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        title="Kembali ke Atas"
      >
        <ArrowUp size={20} />
      </button>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={appSettings.heroImageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2500&auto=format&fit=crop"} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-[scale_40s_ease-in-out_infinite]"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_90%)]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
             <Star size={12} className="text-brand-gold fill-brand-gold" />
             <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">The Premium Choice</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-[1.1] drop-shadow-2xl animate-in fade-in zoom-in duration-1000 delay-100">
            Subaru Daging Sapiku,<br/>
            <span className="animate-shine bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-gold to-white">
              Halal Untuk Semua
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Penyedia daging sapi segar berkualitas tinggi dengan standar Halal & Higienis. 
            Solusi terbaik untuk kebutuhan Rumah Tangga, Restoran, dan Industri.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button 
              onClick={(e) => scrollToSection(e, 'promo')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-bold text-[10px] sm:text-xs tracking-widest hover:bg-brand-gold transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-2 whitespace-nowrap"
            >
              LIHAT KATALOG <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => setActiveModal('referral')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-[10px] sm:text-xs tracking-widest hover:bg-white/5 hover:border-white/50 transition-all whitespace-nowrap"
            >
              KIRIM PENAWARAN
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* --- STATS BAR (FLOATING) --- */}
      <div className="relative z-20 -mt-20 max-w-6xl mx-auto px-6">
        <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-black/5">
          {[
            { label: 'Jaminan Halal', val: '100%', icon: BadgeCheck },
            { label: 'Mitra Horeca', val: '150+', icon: Building },
            { label: 'Freshness', val: '24H', icon: Clock }, // Changed 24H icon to Clock for context
            { label: 'Best Price', val: 'Grosir', icon: Wallet }
          ].map((stat, i) => (
            <div key={i} className="text-center group px-4 first:border-l-0 border-l border-black/5">
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-brand-red/50 group-hover:text-brand-red transition-colors" />
              <p className="text-2xl font-serif font-bold text-black mb-1 group-hover:scale-110 transition-transform duration-300">{stat.val}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- PROMO SECTION (ELEGANT GRID) --- */}
      <section id="promo" className="py-32 max-w-7xl mx-auto px-6 scroll-mt-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Special Offer</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-black">Pilihan Terbaik</h2>
            </div>
            <a href="https://wa.me/6289649005383" target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-black flex items-center gap-2 border-b border-transparent hover:border-black pb-1 transition-all">
                Hubungi Admin Retail <ArrowRight size={14}/>
            </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PRODUCT CARD COMPONENT - DYNAMIC DATA */}
            {(() => {
                // Filter products for promo/special offer
                // Priority: Products with category 'Daging Promo' or explicitly marked
                // Fallback: Take first 4 products if no promo specific found
                let displayProducts = (products && products.length > 0) ? products.filter(p => p.category === 'Daging Promo') : [];
                
                if (displayProducts.length === 0) {
                    displayProducts = (products && products.length > 0) ? products.slice(0, 4) : [
                        { id: '1', name: 'Daging Sapi Premium', price: 145000, unit: 'kg', category: ProductCategory.PREMIUM, image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600', stock: 10, description: 'Daging sapi kualitas terbaik', minStock: 5 },
                        { id: '2', name: 'Iga Sapi', price: 95000, unit: 'kg', category: ProductCategory.BONE, image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600', stock: 5, description: 'Iga sapi segar', minStock: 2 },
                        { id: '3', name: 'Daging Rendang', price: 125000, unit: 'kg', category: ProductCategory.PREMIUM, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600', stock: 15, description: 'Daging khusus rendang', minStock: 5 },
                        { id: '4', name: 'Buntut Sapi', price: 110000, unit: 'kg', category: ProductCategory.BONE, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200', stock: 8, description: 'Buntut sapi segar', minStock: 3 }
                    ] as Product[];
                } else if (displayProducts.length < 4) {
                    // Fill remaining slots with other products
                    const others = products.filter(p => p.category !== 'Daging Promo').slice(0, 4 - displayProducts.length);
                    displayProducts = [...displayProducts, ...others];
                }

                return displayProducts.map((item, idx) => (
                <div key={idx} className={`group relative bg-white rounded-xl overflow-hidden border border-black/5 hover:border-brand-red/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] ${item.stock === 0 ? 'opacity-75 grayscale' : ''}`}>
                    {item.stock === 0 ? (
                        <div className="absolute top-4 left-4 bg-gray-600/90 backdrop-blur text-white text-[9px] font-bold px-3 py-1 rounded-full z-10 tracking-wider">
                            OUT OF STOCK
                        </div>
                    ) : item.stock <= 5 && (
                        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white text-[9px] font-bold px-3 py-1 rounded-full z-10 tracking-wider">
                            LIMITED
                        </div>
                    )}
                    <div className="h-64 overflow-hidden relative">
                        <img 
                            src={item.image || "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600"} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 group-hover:grayscale-0" 
                            alt={item.name}
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/1a1a1a/FFF?text=No+Image"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90"></div>
                    </div>
                    <div className="p-6 relative -mt-20">
                        <h3 className="text-xl font-serif font-bold text-black mb-1 group-hover:text-brand-red transition-colors truncate">{item.name}</h3>
                        <p className="text-gray-500 text-xs mb-4 truncate">{item.description || item.category}</p>
                        
                        <div className="flex items-end justify-between border-t border-black/5 pt-4">
                            <div>
                                {item.category === 'Daging Promo' && <p className="text-[9px] text-brand-red uppercase mb-0.5">Promo Spesial</p>}
                                <p className="text-lg font-mono font-bold text-black">Rp {((item.price || 0)/1000).toLocaleString('id-ID')}k<span className="text-xs text-gray-400 font-sans font-normal">/{item.unit || 'kg'}</span></p>
                            </div>
                            {item.stock > 0 ? (
                                <a 
                                    href={`https://wa.me/6289649005383?text=Halo%20Admin,%20saya%20tertarik%20pesan%20${encodeURIComponent(item.name || 'Produk')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-full bg-black/5 hover:bg-brand-red text-black hover:text-white flex items-center justify-center transition-all"
                                >
                                    <ShoppingCart size={16}/>
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-black/5 text-gray-300 flex items-center justify-center cursor-not-allowed">
                                    <ShoppingCart size={16}/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))})()}
        </div>
      </section>

      {/* --- LOYALTY PROGRAM SECTION --- */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-black/5">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Program Spesial</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-black mb-4">Program Loyalitas Pelanggan</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">Dapatkan reward menarik dengan berlangganan produk daging sapi premium kami selama periode Maret - Agustus 2026.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Reward Tiers */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-serif font-bold text-black mb-6">Skema Reward (6 Bulan)</h3>
                    {[
                        { target: '300 kg', monthly: '50 kg', reward: 'Rp 300.000' },
                        { target: '600 kg', monthly: '100 kg', reward: 'Rp 600.000' },
                        { target: '720 kg', monthly: '120 kg', reward: 'Rp 720.000' },
                        { target: '900 kg', monthly: '150 kg', reward: 'Rp 900.000' },
                        { target: '1.200 kg', monthly: '200 kg', reward: 'Rp 1.200.000' },
                    ].map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-black/5 rounded-xl hover:border-brand-red/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center font-bold text-sm group-hover:bg-brand-red group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-black font-bold">Target: {tier.target}</p>
                                    <p className="text-xs text-gray-400">Rata-rata: {tier.monthly}/bulan</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Reward</p>
                                <p className="text-brand-red font-bold font-mono">{tier.reward}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Terms & Conditions */}
                <div className="bg-gray-50 border border-black/5 rounded-2xl p-8 md:p-10 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-3xl rounded-full"></div>
                    <h3 className="text-xl font-serif font-bold text-black mb-6 flex items-center gap-2">
                        <BadgeCheck className="text-brand-red" size={20} /> Syarat & Ketentuan
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0"></div>
                            <p>Program berlaku untuk <span className="text-black">semua jenis produk daging</span>.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0"></div>
                            <p>Periode kontrak berjalan selama 6 bulan: <span className="text-black">Maret 2026 - Agustus 2026</span>.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0"></div>
                            <p>Reward diberikan setelah kontrak selesai dan target pembelian tercapai.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0"></div>
                            <p>Syarat pencairan reward: Pembayaran lunas / tidak ada tunggakan piutang.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0"></div>
                            <p>Harga produk tidak mengikat dan dapat berubah sewaktu-waktu mengikuti pasar.</p>
                        </li>
                    </ul>
                    
                    <div className="mt-8 pt-6 border-t border-black/10">
                        <a href="https://wa.me/6281369612006" target="_blank" rel="noreferrer" className="w-full py-3 bg-black text-white font-bold rounded-lg text-xs tracking-widest uppercase hover:bg-brand-red transition-colors flex items-center justify-center gap-2">
                            Daftar Program Sekarang <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- PARTNERSHIP SECTION (MINIMALIST SPLIT) --- */}
      <section id="partnership" className="py-24 bg-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red/5 blur-3xl rounded-full translate-x-1/2"></div>
         
         <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Partnership Info */}
                <div className="bg-gray-50 border border-black/5 rounded-3xl p-10 md:p-16 flex flex-col justify-center shadow-xl">
                    <span className="text-brand-red text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Building size={14} /> B2B Solution
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-6 leading-tight">Partner Bisnis & Horeca</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-10">
                        Supply rantai dingin terpercaya untuk Restoran, Hotel, Catering, dan Industri Olahan. 
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="https://wa.me/6281369612006" target="_blank" rel="noreferrer" className="px-8 py-4 bg-black text-white rounded-full font-bold text-xs tracking-widest hover:bg-brand-red transition-colors w-fit flex items-center gap-2">
                            HUBUNGI ADMIN GROSIR <ArrowRight size={14}/>
                        </a>
                        <a href="https://wa.me/6289514077980" target="_blank" rel="noreferrer" className="px-8 py-4 bg-transparent border border-black/20 text-black rounded-full font-bold text-xs tracking-widest hover:bg-black/5 transition-colors w-fit flex items-center gap-2">
                            JADWAL KUNJUNGAN SALES <ArrowRight size={14}/>
                        </a>
                    </div>
                </div>

                {/* Referral Section for Employees */}
                <div className="bg-gray-50 border border-black/5 rounded-3xl p-10 md:p-16 flex flex-col justify-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target size={120} className="text-brand-red" />
                    </div>
                    <span className="text-brand-red text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <UserCheck size={14} /> Referral Karyawan
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-6 leading-tight">Kirim Penawaran</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-10">
                        Punya kenalan calon pembeli? Referensikan mereka di sini untuk mendapatkan reward khusus dari perusahaan.
                    </p>
                    <button onClick={() => setActiveModal('referral')} className="px-8 py-4 bg-brand-red text-white rounded-full font-bold text-xs tracking-widest hover:bg-red-700 transition-colors w-fit shadow-lg shadow-brand-red/20">
                        INPUT REFERRAL
                    </button>
                </div>
            </div>
         </div>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Gallery</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-black">gallery subaru daging sapi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {((galleryItems && galleryItems.length > 0) ? galleryItems : [
                      { id: 'g1', title: 'Proses Produksi Higienis', subtitle: 'Standar keamanan pangan internasional', imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200", date: '01 Mar 2026', category: 'Produksi', content: 'Kami menerapkan standar HACCP dalam setiap proses produksi daging sapi kami...' },
                      { id: 'g2', title: 'Distribusi Armada', subtitle: 'Pengiriman tepat waktu', imageUrl: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600", date: '28 Feb 2026', category: 'Logistik', content: 'Armada kami dilengkapi dengan pendingin untuk menjaga kualitas daging tetap segar...' },
                      { id: 'g3', title: 'Kunjungan Dinas', subtitle: 'Sinergi dengan pemerintah', imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600", date: '25 Feb 2026', category: 'Kegiatan', content: 'Menerima kunjungan dari Dinas Peternakan untuk peninjauan standar RPH...' },
                      { id: 'g4', title: 'Kualitas Premium', subtitle: 'Daging pilihan terbaik', imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200", date: '20 Feb 2026', category: 'Produk', content: 'Setiap potongan daging melewati kontrol kualitas yang ketat sebelum dipasarkan...' }
                      ]).map((item, idx) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                            setSelectedArticle(item);
                            setActiveModal('article');
                        }}
                        className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                            idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:h-[500px]' : 
                            idx === 3 ? 'md:col-span-3 h-60 md:h-64' : 'h-60 md:h-auto'
                        }`}
                      >
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                          <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                              <span className="text-brand-red text-[10px] font-bold uppercase tracking-widest mb-2 block">{item.category || 'Kegiatan'}</span>
                              <h3 className={`${idx === 0 ? 'text-2xl' : 'text-lg'} text-white font-bold leading-tight mb-1`}>{item.title}</h3>
                              <p className="text-gray-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">{item.subtitle || 'Klik untuk selengkapnya'}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOOTER (CLEAN) --- */}
      <footer className="bg-[#0a0a0a] border-t border-black/10 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-serif font-bold">S</div>
                        <span className="font-serif text-xl font-bold tracking-widest text-white">PT. SUBARU ALAM MAKMUR</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">
                        PT. Subaru Alam Makmur adalah distributor daging sapi premium yang berkomitmen pada kualitas, kehalalan, dan pelayanan terbaik untuk masyarakat Indonesia.
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2 flex items-start gap-2">
                        <MapPin size={12} className="mt-1 flex-shrink-0" /> 
                        <span>Alamat: Jl. Pisang Tanduk No.51, Gedong Air, Kecamatan Karang Barat, Kota Bandar Lampung, Lampung 35151, Indonesia.</span>
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mb-6 flex items-center gap-2">
                        <Mail size={12} /> ptsubarualammakmur@gmail.com
                    </p>
                    <div className="flex gap-4">
                        {[
                            { icon: ShoppingBag, link: 'https://shopee.co.id/subarumeat', color: 'hover:text-orange-500', label: 'Shopee' },
                            { icon: Video, link: 'https://www.tiktok.com/@subarudaging?lang=id-ID', color: 'hover:text-pink-500', label: 'TikTok' },
                            { icon: Instagram, link: 'https://www.instagram.com/subarudagingsapiku/#', color: 'hover:text-purple-500', label: 'Instagram' },
                            { icon: Youtube, link: 'https://www.youtube.com/@subarudagingsapiku', color: 'hover:text-red-500', label: 'YouTube' },
                            { icon: Facebook, link: 'https://web.facebook.com/profile.php?id=61588132628397', color: 'hover:text-blue-500', label: 'Facebook' }
                        ].map((social, i) => (
                            <a 
                                key={i} 
                                href={social.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-all hover:bg-white/10 hover:scale-110 ${social.color}`}
                                title={social.label}
                            >
                                <social.icon size={14}/>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Fast Contact</h4>
                        <ul className="space-y-3 text-xs text-gray-400">
                            <li><a href="https://wa.me/6289649005383" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><MessageCircle size={14}/> Admin Retail (WA)</a></li>
                            <li><a href="https://wa.me/6281369612006" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><MessageCircle size={14}/> Admin Grosir (WA)</a></li>
                            <li><a href="https://wa.me/6289514077980" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><MessageCircle size={14}/> Sales Visit</a></li>
                            <li><a href="tel:+6285166599976" className="hover:text-brand-red transition-colors flex items-center gap-2"><Phone size={14}/> Hotline Kantor</a></li>
                            <li><a href="mailto:ptsubarualammakmur@gmail.com" className="hover:text-brand-red transition-colors flex items-center gap-2"><Mail size={14}/> ptsubarualammakmur@gmail.com</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Link Terkait</h4>
                        <ul className="space-y-3 text-xs text-gray-400">
                            <li><a href="https://disnakkeswan.lampungprov.go.id/" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><Globe size={12}/> Dinas Peternakan Lampung</a></li>
                            <li><a href="https://disperindag.lampungprov.go.id/" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><Globe size={12}/> Dinas Perdagangan Lampung</a></li>
                            <li><a href="https://lampungprov.go.id/" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><Globe size={12}/> Pemprov Lampung</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Legal & Karir</h4>
                        <ul className="space-y-3 text-xs text-gray-400">
                            <li><button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                            <li><button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
                            <li><button onClick={() => setActiveModal('career')} className="hover:text-white transition-colors text-left">Karir</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    &copy; 2026 PT. Subaru Alam Makmur. All rights reserved.
                </p>
                <p className="text-[10px] text-gray-600">
                    Bandar Lampung, Indonesia
                </p>
            </div>
        </div>
      </footer>

      {/* --- MODALS (Reused Logic) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-2xl border border-black/5 p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                 <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"><XIcon size={20}/></button>
                 
                 {activeModal === 'loyalty' ? (
                       <div className="text-center">
                           <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red">
                               <BadgeCheck size={32} />
                           </div>
                           <h3 className="text-2xl font-serif font-bold text-black mb-2">Pendaftaran Program</h3>
                           <p className="text-gray-500 text-xs mb-8">Silakan lengkapi data Anda untuk bergabung dalam program loyalitas kami.</p>
                           
                           <form className="space-y-4 text-left">
                               <div>
                                   <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap / Toko</label>
                                   <input type="text" className="w-full bg-gray-50 border border-black/5 rounded-lg px-4 py-3 text-black text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="Contoh: Budi Santoso / Toko Berkah" />
                               </div>
                               <div>
                                   <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nomor WhatsApp</label>
                                   <input type="tel" className="w-full bg-gray-50 border border-black/5 rounded-lg px-4 py-3 text-black text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="0812..." />
                               </div>
                               <div className="pt-4">
                                   <button 
                                     type="button"
                                     onClick={() => {
                                         setIsSubmitting(true);
                                         setTimeout(() => {
                                             setIsSubmitting(false);
                                             setActiveModal('success');
                                         }, 1500);
                                     }}
                                     className="w-full py-4 bg-black text-white font-bold rounded-lg text-xs tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                   >
                                       {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'KIRIM PENDAFTARAN'}
                                   </button>
                               </div>
                           </form>
                       </div>
                   ) : activeModal === 'article' && selectedArticle ? (
                       <div className="text-left max-h-[80vh] overflow-y-auto pr-2">
                           <img src={selectedArticle.imageUrl} className="w-full h-64 object-cover rounded-xl mb-6" alt={selectedArticle.title} />
                           <div className="flex items-center gap-3 mb-4">
                               <span className="bg-brand-red/10 text-brand-red text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{selectedArticle.category || 'Berita'}</span>
                               <span className="text-gray-500 text-[10px] uppercase tracking-widest">{selectedArticle.date}</span>
                           </div>
                           <h3 className="text-2xl font-serif font-bold text-black mb-4">{selectedArticle.title}</h3>
                           <div className="text-sm text-gray-500 space-y-4 leading-relaxed whitespace-pre-wrap">
                               {selectedArticle.content || 'Konten artikel belum tersedia.'}
                           </div>
                           <button onClick={handleCloseModal} className="w-full py-3 mt-8 bg-gray-50 border border-black/5 text-black font-bold rounded-lg text-xs tracking-widest hover:bg-gray-100 transition-colors uppercase">Tutup</button>
                       </div>
                   ) : activeModal === 'success' ? (
                      <div className="text-center">
                         <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                             <CheckCircle size={32} />
                         </div>
                         <h3 className="text-xl font-serif font-bold text-black mb-2">Berhasil</h3>
                         <p className="text-gray-500 text-xs mb-6">Data Anda telah kami terima dan tercatat di sistem.</p>
                         <button onClick={handleCloseModal} className="w-full py-3 bg-black text-white font-bold rounded-lg text-xs tracking-widest hover:bg-gray-800 uppercase">Tutup</button>
                      </div>
                  ) : activeModal === 'checkin' ? (
                      <div className="text-center">
                          <h3 className="text-xl font-serif font-bold text-black mb-2">Check-In Karyawan</h3>
                          <p className="text-gray-500 text-xs mb-6">Pilih nama Anda untuk melakukan absensi harian.</p>
                          
                          <form onSubmit={handleCheckInSubmit} className="space-y-4">
                              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                                  <button
                                      type="button"
                                      onClick={() => setCheckInType('Masuk')}
                                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${checkInType === 'Masuk' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                                  >
                                      MASUK KERJA
                                  </button>
                                  <button
                                      type="button"
                                      onClick={() => setCheckInType('Pulang')}
                                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${checkInType === 'Pulang' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                                  >
                                      PULANG KERJA
                                  </button>
                              </div>

                              <select 
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm text-black focus:border-brand-red outline-none"
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
                        <h3 className="text-xl font-serif font-bold text-black mb-2">Input Referral</h3>
                        <p className="text-gray-500 text-xs mb-6">Referensikan calon pembeli sapi/daging.</p>
                        
                        <form onSubmit={handleReferralSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Nama Calon Pembeli</label>
                                <input 
                                    type="text" 
                                    required
                                    value={referralData.name}
                                    onChange={(e) => setReferralData({...referralData, name: e.target.value})}
                                    className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm text-black focus:border-brand-red outline-none" 
                                    placeholder="Nama Lengkap" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">No. WhatsApp</label>
                                <input 
                                    type="text" 
                                    required
                                    value={referralData.phone}
                                    onChange={(e) => setReferralData({...referralData, phone: e.target.value})}
                                    className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm text-black focus:border-brand-red outline-none" 
                                    placeholder="08xxxxxxxx" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Minat Produk</label>
                                <select 
                                    value={referralData.interest}
                                    onChange={(e) => setReferralData({...referralData, interest: e.target.value})}
                                    className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm text-black focus:border-brand-red outline-none"
                                >
                                    <option value="Daging Sapi">Daging Sapi</option>
                                    <option value="Sapi Hidup">Sapi Hidup</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Catatan Tambahan</label>
                                <textarea 
                                    value={referralData.notes}
                                    onChange={(e) => setReferralData({...referralData, notes: e.target.value})}
                                    className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm text-black focus:border-brand-red outline-none h-20 resize-none" 
                                    placeholder="Contoh: Butuh 5 ekor sapi untuk kurban..." 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand-red text-white font-bold rounded-lg text-xs tracking-widest uppercase flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                {isSubmitting ? 'Mengirim...' : 'Kirim Referral'}
                            </button>
                        </form>
                    </div>
                  ) : activeModal === 'privacy' ? (
                      <div className="text-left max-h-[70vh] overflow-y-auto pr-2">
                          <h3 className="text-xl font-serif font-bold text-black mb-4">Privacy Policy</h3>
                          <div className="text-xs text-gray-500 space-y-3">
                              <p><strong>1. Pengumpulan Data</strong><br/>PT. Subaru Alam Makmur mengumpulkan data pribadi (nama, kontak) hanya untuk keperluan transaksi dan layanan pelanggan.</p>
                              <p><strong>2. Penggunaan Data</strong><br/>Data digunakan untuk memproses pesanan, pengiriman, dan komunikasi terkait layanan.</p>
                              <p><strong>3. Keamanan</strong><br/>Kami menjaga kerahasiaan data Anda dan tidak membagikannya ke pihak ketiga tanpa persetujuan, kecuali diwajibkan hukum.</p>
                              <p><strong>4. Hak Pengguna</strong><br/>Anda berhak meminta penghapusan atau perubahan data pribadi Anda dari sistem kami.</p>
                          </div>
                          <button onClick={handleCloseModal} className="w-full py-3 mt-6 bg-black text-white font-bold rounded-lg text-xs tracking-widest hover:bg-gray-800 uppercase">Tutup</button>
                      </div>
                  ) : activeModal === 'terms' ? (
                      <div className="text-left max-h-[70vh] overflow-y-auto pr-2">
                          <h3 className="text-xl font-serif font-bold text-black mb-4">Terms of Service</h3>
                          <div className="text-xs text-gray-500 space-y-3">
                              <p><strong>1. Layanan</strong><br/>Kami menyediakan daging sapi segar dan beku dengan standar Halal.</p>
                              <p><strong>2. Pemesanan</strong><br/>Pesanan dianggap sah setelah konfirmasi pembayaran atau kesepakatan term pembayaran (untuk B2B).</p>
                              <p><strong>3. Pengiriman</strong><br/>Jadwal pengiriman disesuaikan dengan rute dan ketersediaan armada.</p>
                              <p><strong>4. Komplain</strong><br/>Komplain kualitas produk maksimal 1x24 jam setelah barang diterima dengan bukti foto/video.</p>
                          </div>
                          <button onClick={handleCloseModal} className="w-full py-3 mt-6 bg-black text-white font-bold rounded-lg text-xs tracking-widest hover:bg-gray-800 uppercase">Tutup</button>
                      </div>
                  ) : activeModal === 'career' ? (
                      <div className="text-center">
                          <h3 className="text-xl font-serif font-bold text-black mb-2">Karir</h3>
                          <p className="text-gray-500 text-xs mb-6">Bergabunglah dengan tim profesional kami.</p>
                          
                          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                              <h4 className="text-black font-bold text-sm">Posisi Tersedia:</h4>
                              <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1">
                                  <li>Sales Executive (Area Lampung)</li>
                                  <li>Staff Gudang & Logistik</li>
                                  <li>Admin Finance</li>
                              </ul>
                          </div>

                          <p className="text-xs text-gray-400 mb-4">Kirim CV Anda ke email kami dengan subjek "Lamaran Kerja - [Posisi]".</p>
                          
                          <a href="mailto:ptsubarualammakmur@gmail.com" className="block w-full py-3 bg-brand-red text-white rounded-lg font-bold mb-3 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                              <Mail size={18}/> Kirim Email
                          </a>
                          <button onClick={handleCloseModal} className="block w-full py-3 bg-transparent border border-black/5 text-gray-400 rounded-lg font-bold text-xs hover:text-black hover:border-black/20 transition-colors">
                              Kembali
                          </button>
                      </div>
                  ) : (
                      <div className="text-center">
                         <h3 className="text-xl font-serif font-bold text-black mb-2">Hubungi Kami</h3>
                         <p className="text-gray-500 text-xs mb-6">Silakan hubungi admin via WhatsApp untuk respon cepat.</p>
                         
                         <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="block w-full py-3 bg-[#25D366] text-white rounded-lg font-bold mb-3 flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-600/20">
                             <MessageCircle size={18}/> Chat WhatsApp
                         </a>
                         <button onClick={handleCloseModal} className="block w-full py-3 bg-transparent border border-black/5 text-gray-400 rounded-lg font-bold text-xs hover:text-black hover:border-black/20 transition-colors">
                             Kembali
                         </button>
                      </div>
                  )}
            </div>
        </div>
      )}

    </div>
  );
};

export default PublicLanding;