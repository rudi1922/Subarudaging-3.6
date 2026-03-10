import React from 'react';
import { GalleryItem } from '../../types';

interface GalleryProps {
  galleryItems: GalleryItem[];
  onArticleClick: (item: GalleryItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ galleryItems, onArticleClick }) => {
  const displayItems = (galleryItems && galleryItems.length > 0) ? galleryItems : [
    { id: 'g1', title: 'Proses Produksi Higienis', subtitle: 'Standar keamanan pangan internasional', imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200", date: '01 Mar 2026', category: 'Produksi', content: 'Kami menerapkan standar HACCP dalam setiap proses produksi daging sapi kami...' },
    { id: 'g2', title: 'Distribusi Armada', subtitle: 'Pengiriman tepat waktu', imageUrl: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600", date: '28 Feb 2026', category: 'Logistik', content: 'Armada kami dilengkapi dengan pendingin untuk menjaga kualitas daging tetap segar...' },
    { id: 'g3', title: 'Kunjungan Dinas', subtitle: 'Sinergi dengan pemerintah', imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600", date: '25 Feb 2026', category: 'Kegiatan', content: 'Menerima kunjungan dari Dinas Peternakan untuk peninjauan standar RPH...' },
    { id: 'g4', title: 'Kualitas Premium', subtitle: 'Daging pilihan terbaik', imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200", date: '20 Feb 2026', category: 'Produk', content: 'Setiap potongan daging melewati kontrol kualitas yang ketat sebelum dipasarkan...' }
  ] as GalleryItem[];

  return (
    <section className="py-24 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Gallery</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">gallery subaru daging sapi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayItems.map((item, idx) => (
                  <div 
                    key={item.id}
                    onClick={() => onArticleClick(item)}
                    className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                        idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:h-[500px]' : 
                        idx === 3 ? 'md:col-span-3 h-60 md:h-64' : 'h-60 md:h-auto'
                    }`}
                  >
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                      <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-2 block">{item.category || 'Kegiatan'}</span>
                          <h3 className={`${idx === 0 ? 'text-2xl' : 'text-lg'} text-white font-bold leading-tight mb-1`}>{item.title}</h3>
                          <p className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">{item.subtitle || 'Klik untuk selengkapnya'}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </section>
  );
};

export default Gallery;
