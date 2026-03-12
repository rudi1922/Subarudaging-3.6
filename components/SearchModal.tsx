import React, { useState, useEffect } from 'react';
import { Search, X, Package, User, ShoppingCart } from 'lucide-react';
import { useStore } from '../StoreContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { searchQuery, setSearchQuery, products, customers, transactions } = useStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(localQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(localQuery.toLowerCase())
  ).slice(0, 5);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(localQuery.toLowerCase()) || 
    c.phone.includes(localQuery)
  ).slice(0, 5);

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(localQuery.toLowerCase()) || 
    t.customerName.toLowerCase().includes(localQuery.toLowerCase())
  ).slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="text-gray-500" size={20} />
          <form onSubmit={handleSearch} className="flex-1">
            <input 
              autoFocus
              type="text" 
              placeholder="Cari produk, pelanggan, karyawan, atau transaksi..." 
              className="w-full bg-transparent border-none text-white focus:outline-none text-lg"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </form>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {localQuery.length > 0 ? (
            <>
              {/* Products */}
              {filteredProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Produk</h4>
                  <div className="space-y-1">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-red/20 transition-colors">
                          <Package size={16} className="text-gray-400 group-hover:text-brand-red" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category} • Rp {p.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {filteredCustomers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Pelanggan</h4>
                  <div className="space-y-1">
                    {filteredCustomers.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                          <User size={16} className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.phone} • {c.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              {filteredTransactions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Transaksi</h4>
                  <div className="space-y-1">
                    {filteredTransactions.map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-green-500/20 transition-colors">
                          <ShoppingCart size={16} className="text-gray-400 group-hover:text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{t.id}</p>
                          <p className="text-xs text-gray-500">{t.customerName} • Rp {t.total.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && filteredCustomers.length === 0 && filteredTransactions.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">Tidak ada hasil untuk "{localQuery}"</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Search className="mx-auto text-gray-700 mb-3" size={48} />
              <p className="text-gray-500">Ketik sesuatu untuk mulai mencari...</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-black/20 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500">
          <div className="flex gap-4">
            <span><kbd className="bg-white/10 px-1 rounded text-gray-300">ESC</kbd> untuk menutup</span>
            <span><kbd className="bg-white/10 px-1 rounded text-gray-300">ENTER</kbd> untuk cari global</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-brand-red rounded-full"></span>
            <span>Subaru Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
