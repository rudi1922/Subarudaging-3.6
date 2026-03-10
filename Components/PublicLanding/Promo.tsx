import React from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Product, ProductCategory } from '../../types';

interface PromoProps {
  products: Product[];
}

const Promo: React.FC<PromoProps> = ({ products }) => {
  // Filter products for promo/special offer
  let displayProducts = (products && products.length > 0) ? products.filter(p => p.category === 'Daging Promo') : [];
  
  if (displayProducts.length === 0) {
      displayProducts = (products && products.length > 0) ? products.slice(0, 4) : [
          { id: '1', name: 'Daging Sapi Premium', price: 145000, unit: 'kg', category: ProductCategory.PREMIUM, image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600', stock: 10, description: 'Daging sapi kualitas terbaik', minStock: 5 },
          { id: '2', name: 'Iga Sapi', price: 95000, unit: 'kg', category: ProductCategory.BONE, image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600', stock: 5, description: 'Iga sapi segar', minStock: 2 },
          { id: '3', name: 'Daging Rendang', price: 125000, unit: 'kg', category: ProductCategory.PREMIUM, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600', stock: 15, description: 'Daging khusus rendang', minStock: 5 },
          { id: '4', name: 'Buntut Sapi', price: 110000, unit: 'kg', category: ProductCategory.BONE, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200', stock: 8, description: 'Buntut sapi segar', minStock: 3 }
      ] as Product[];
  } else if (displayProducts.length < 4) {
      const others = products.filter(p => p.category !== 'Daging Promo').slice(0, 4 - displayProducts.length);
      displayProducts = [...displayProducts, ...others];
  }

  return (
    <section id="promo" className="py-32 max-w-7xl mx-auto px-6 scroll-mt-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Special Offer</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Pilihan Terbaik</h2>
          </div>
          <a href="https://wa.me/6289649005383" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 border-b border-transparent hover:border-white pb-1 transition-all">
              Hubungi Admin Retail <ArrowRight size={14}/>
          </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((item, idx) => (
              <div key={idx} className={`group relative bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 hover:border-brand-gold/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${item.stock === 0 ? 'opacity-75 grayscale' : ''}`}>
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
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" 
                          alt={item.name}
                          onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/1a1a1a/FFF?text=No+Image"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
                  </div>
                  <div className="p-6 relative -mt-20">
                      <h3 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-brand-gold transition-colors truncate">{item.name}</h3>
                      <p className="text-gray-500 text-xs mb-4 truncate">{item.description || item.category}</p>
                      
                      <div className="flex items-end justify-between border-t border-white/5 pt-4">
                          <div>
                              {item.category === 'Daging Promo' && <p className="text-[9px] text-brand-gold uppercase mb-0.5">Promo Spesial</p>}
                              <p className="text-lg font-mono font-bold text-white">Rp {((item.price || 0)/1000).toLocaleString('id-ID')}k<span className="text-xs text-gray-600 font-sans font-normal">/{item.unit || 'kg'}</span></p>
                          </div>
                          {item.stock > 0 ? (
                              <a 
                                  href={`https://wa.me/6289649005383?text=Halo%20Admin,%20saya%20tertarik%20pesan%20${encodeURIComponent(item.name || 'Produk')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-red text-white flex items-center justify-center transition-all"
                              >
                                  <ShoppingCart size={16}/>
                              </a>
                          ) : (
                              <div className="w-10 h-10 rounded-full bg-white/5 text-gray-600 flex items-center justify-center cursor-not-allowed">
                                  <ShoppingCart size={16}/>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </section>
  );
};

export default Promo;
