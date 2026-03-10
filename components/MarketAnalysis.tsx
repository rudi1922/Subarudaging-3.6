import React, { useState } from 'react';
import { TrendingUp, Globe, FileText, Plus, Search, ExternalLink, BarChart2, ArrowUpRight, Trash2, ClipboardList } from 'lucide-react';
import { useStore } from '../StoreContext';
import { MarketNote, PricePoint, MarketSurvey } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MarketAnalysis: React.FC = () => {
  const { marketNotes, addMarketNote, deleteMarketNote, pricePoints, addPricePoint, marketSurveys, addMarketSurvey } = useStore();
  const [activeTab, setActiveTab] = useState<'external' | 'internal' | 'charts' | 'survey'>('external');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showPriceInputModal, setShowPriceInputModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  
  const [newNote, setNewNote] = useState<Partial<MarketNote>>({
      category: 'Lokal (Lampung)',
      tags: []
  });

  const [newPrice, setNewPrice] = useState<Partial<PricePoint>>({
      date: new Date().toISOString().split('T')[0]
  });

  const [newSurvey, setNewSurvey] = useState<Partial<MarketSurvey>>({
      date: new Date().toISOString().split('T')[0],
      marketName: 'Pasar Tugu',
      commodity: 'Daging Murni'
  });

  const quickSearches = [
      { label: 'Harga Sapi Hidup Lampung Hari Ini', query: 'harga sapi hidup lampung hari ini' },
      { label: 'Harga Daging Sapi Nasional Terkini', query: 'harga daging sapi nasional hari ini' },
      { label: 'Berita Impor Sapi Indonesia 2026', query: 'berita impor sapi indonesia 2026' },
      { label: 'Tren Konsumsi Daging Sapi 2026', query: 'tren konsumsi daging sapi indonesia 2026' },
      { label: 'Kebijakan Pemerintah Peternakan Sapi', query: 'kebijakan pemerintah peternakan sapi terbaru' },
  ];

  const handleGoogleSearch = (query: string) => {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const handleAddNote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNote.title || !newNote.content) return;

      addMarketNote({
          id: `MN-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: newNote.title,
          category: newNote.category as MarketNote['category'],
          content: newNote.content,
          author: 'Admin', // In real app, use logged in user
          source: newNote.source || 'Internal Observation',
          tags: newNote.tags || []
      });
      setShowNewNoteModal(false);
      setNewNote({ category: 'Lokal (Lampung)', tags: [] });
  };

  const handleAddPrice = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPrice.date || !newPrice.sapiHidup || !newPrice.dagingSapi) return;

      addPricePoint({
          id: `PP-${Date.now()}`,
          date: newPrice.date, // Simplification: using full date string as label
          sapiHidup: Number(newPrice.sapiHidup),
          dagingSapi: Number(newPrice.dagingSapi)
      });
      setShowPriceInputModal(false);
      setNewPrice({ date: new Date().toISOString().split('T')[0] });
  };

  const handleAddSurvey = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSurvey.marketName || !newSurvey.price || !newSurvey.commodity) return;

      addMarketSurvey({
          id: `MS-${Date.now()}`,
          date: newSurvey.date || new Date().toISOString().split('T')[0],
          marketName: newSurvey.marketName,
          commodity: newSurvey.commodity as MarketSurvey['commodity'],
          price: Number(newSurvey.price),
          reporter: newSurvey.reporter || 'Admin',
          notes: newSurvey.notes
      });
      setShowSurveyModal(false);
      setNewSurvey({ date: new Date().toISOString().split('T')[0], marketName: 'Pasar Tugu', commodity: 'Daging Murni' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp size={32} className="text-brand-gold" />
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">Analisa Pasar</h1>
            <p className="text-gray-400 text-sm">Monitoring harga, tren, dan berita pasar sapi & daging.</p>
          </div>
        </div>
        <div className="flex gap-3">
            {activeTab === 'charts' && (
                <button 
                    onClick={() => setShowPriceInputModal(true)}
                    className="bg-[#1e1e1e] border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5"
                >
                    <Plus size={18} /> Input Harga
                </button>
            )}
            {activeTab === 'survey' && (
                <button 
                    onClick={() => setShowSurveyModal(true)}
                    className="bg-[#1e1e1e] border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5"
                >
                    <Plus size={18} /> Input Survey
                </button>
            )}
            <button 
                onClick={() => setShowNewNoteModal(true)}
                className="bg-brand-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
            >
                <Plus size={18} /> Catat Analisa
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('external')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'external' ? 'border-brand-gold text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Globe size={16} /> Berita & Eksternal
        </button>
        <button 
          onClick={() => setActiveTab('internal')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'internal' ? 'border-brand-gold text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <FileText size={16} /> Catatan Internal
        </button>
        <button 
          onClick={() => setActiveTab('survey')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'survey' ? 'border-brand-gold text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <ClipboardList size={16} /> Survey Pasar
        </button>
        <button 
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'charts' ? 'border-brand-gold text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <BarChart2 size={16} /> Grafik Tren
        </button>
      </div>

      {/* Content */}
      {activeTab === 'external' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Search size={20} className="text-brand-gold" />
                          Pencarian Cepat (Google Market Insights)
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                          Gunakan tombol di bawah untuk mencari informasi pasar terkini langsung dari Google.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {quickSearches.map((item, idx) => (
                              <button 
                                  key={idx}
                                  onClick={() => handleGoogleSearch(item.query)}
                                  className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-lg hover:border-brand-gold/50 hover:bg-white/5 transition-all text-left group"
                              >
                                  <span className="text-sm text-gray-300 group-hover:text-white">{item.label}</span>
                                  <ExternalLink size={14} className="text-gray-500 group-hover:text-brand-gold" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Artikel Referensi (Simulasi)</h3>
                      <div className="space-y-4">
                          {[
                              { title: 'Kementan Pastikan Stok Daging Aman Jelang Lebaran', source: 'Antara News', date: '2 Hari lalu' },
                              { title: 'Harga Sapi Bakalan Australia Naik 5%', source: 'Bisnis.com', date: '3 Hari lalu' },
                              { title: 'Lampung Jadi Lumbung Ternak Nasional', source: 'Radar Lampung', date: '1 Minggu lalu' }
                          ].map((news, i) => (
                              <div key={i} className="flex justify-between items-start p-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={() => handleGoogleSearch(news.title)}>
                                  <div>
                                      <h4 className="text-white font-medium text-sm hover:text-brand-gold hover:underline">{news.title}</h4>
                                      <p className="text-xs text-gray-500 mt-1">{news.source} • {news.date}</p>
                                  </div>
                                  <ArrowUpRight size={14} className="text-gray-600" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-brand-red/20 to-black border border-brand-red/30 rounded-xl p-6">
                      <h3 className="text-white font-bold mb-2">Tips Analisa</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                          Selalu bandingkan harga pasar lokal dengan harga pokok produksi (HPP) perusahaan. Perhatikan juga faktor musiman seperti hari raya yang mempengaruhi permintaan.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'internal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketNotes.map(note => (
                  <div key={note.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl p-5 hover:border-brand-gold/30 transition-all group relative">
                      <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${
                              note.category === 'Nasional' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                              note.category === 'Lokal (Lampung)' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                              'border-orange-500/30 text-orange-500 bg-orange-500/10'
                          }`}>
                              {note.category}
                          </span>
                          <span className="text-xs text-gray-500">{note.date}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{note.title}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-3">{note.content}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-xs text-gray-600">By: {note.author}</span>
                          {note.source && <span className="text-xs text-brand-gold italic truncate max-w-[150px]">{note.source}</span>}
                      </div>
                      
                      {/* Delete Action */}
                      <button 
                          onClick={() => deleteMarketNote(note.id)}
                          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              ))}
              {marketNotes.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                      Belum ada catatan analisa.
                  </div>
              )}
          </div>
      )}

      {activeTab === 'survey' && (
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ClipboardList size={20} className="text-brand-gold" />
                      Data Survey Pasar Harian (Lampung)
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                              <th className="p-3">Tanggal</th>
                              <th className="p-3">Nama Pasar</th>
                              <th className="p-3">Komoditas</th>
                              <th className="p-3">Harga (Rp/kg)</th>
                              <th className="p-3">Reporter</th>
                              <th className="p-3">Catatan</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300">
                          {marketSurveys.map(survey => (
                              <tr key={survey.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 whitespace-nowrap font-mono text-xs text-gray-400">{survey.date}</td>
                                  <td className="p-3 font-bold text-white">{survey.marketName}</td>
                                  <td className="p-3">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                          survey.commodity === 'Sapi Hidup' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                          'bg-red-500/10 text-red-500 border-red-500/20'
                                      }`}>
                                          {survey.commodity}
                                      </span>
                                  </td>
                                  <td className="p-3 font-mono text-brand-gold">Rp {survey.price.toLocaleString()}</td>
                                  <td className="p-3 text-xs text-gray-400">{survey.reporter}</td>
                                  <td className="p-3 text-xs text-gray-500 italic max-w-xs truncate">{survey.notes || '-'}</td>
                              </tr>
                          ))}
                          {marketSurveys.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                      Belum ada data survey. Silakan input data baru.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'charts' && (
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Tren Harga Pasar</h3>
                  <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 bg-[#F27D26] rounded-full"></div> Sapi Hidup</span>
                      <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 bg-[#E50914] rounded-full"></div> Daging Sapi</span>
                  </div>
              </div>
              <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pricePoints}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                              itemStyle={{ color: '#fff' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="sapiHidup" stroke="#F27D26" name="Sapi Hidup (Rp/kg)" strokeWidth={2} />
                          <Line type="monotone" dataKey="dagingSapi" stroke="#E50914" name="Daging Sapi (Rp/kg)" strokeWidth={2} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* New Note Modal */}
      {showNewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Catat Analisa Baru</h2>
                  <form onSubmit={handleAddNote} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Judul</label>
                          <input 
                              type="text" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newNote.title || ''}
                              onChange={e => setNewNote({...newNote, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Kategori</label>
                          <select 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newNote.category}
                              onChange={e => setNewNote({...newNote, category: e.target.value as MarketNote['category']})}
                          >
                              <option value="Lokal (Lampung)">Lokal (Lampung)</option>
                              <option value="Nasional">Nasional</option>
                              <option value="Kompetitor">Kompetitor</option>
                              <option value="Regulasi">Regulasi</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Isi Analisa</label>
                          <textarea 
                              required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm h-32"
                              value={newNote.content || ''}
                              onChange={e => setNewNote({...newNote, content: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Sumber (Opsional)</label>
                          <input 
                              type="text"
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              placeholder="Contoh: Pengamatan Pasar, Berita Kompas, dll"
                              value={newNote.source || ''}
                              onChange={e => setNewNote({...newNote, source: e.target.value})}
                          />
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowNewNoteModal(false)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Price Input Modal */}
      {showPriceInputModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Input Data Harga Pasar</h2>
                  <form onSubmit={handleAddPrice} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Periode / Tanggal</label>
                          <input 
                              type="text" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              placeholder="Contoh: Jul 2026 atau 2026-07-20"
                              value={newPrice.date || ''}
                              onChange={e => setNewPrice({...newPrice, date: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Harga Sapi Hidup (Rp/kg)</label>
                          <input 
                              type="number" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newPrice.sapiHidup || ''}
                              onChange={e => setNewPrice({...newPrice, sapiHidup: Number(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Harga Daging Sapi (Rp/kg)</label>
                          <input 
                              type="number" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newPrice.dagingSapi || ''}
                              onChange={e => setNewPrice({...newPrice, dagingSapi: Number(e.target.value)})}
                          />
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowPriceInputModal(false)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      {/* Survey Modal */}
      {showSurveyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Input Survey Pasar</h2>
                  <form onSubmit={handleAddSurvey} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Tanggal</label>
                          <input 
                              type="date" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newSurvey.date || ''}
                              onChange={e => setNewSurvey({...newSurvey, date: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Nama Pasar / Lokasi</label>
                          <input 
                              type="text" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              placeholder="Contoh: Pasar Tugu"
                              value={newSurvey.marketName || ''}
                              onChange={e => setNewSurvey({...newSurvey, marketName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Komoditas</label>
                          <select 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newSurvey.commodity}
                              onChange={e => setNewSurvey({...newSurvey, commodity: e.target.value as MarketSurvey['commodity']})}
                          >
                              <option value="Daging Murni">Daging Murni</option>
                              <option value="Daging Fat">Daging Fat</option>
                              <option value="Sapi Hidup">Sapi Hidup</option>
                              <option value="Jeroan">Jeroan</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Harga (Rp/kg)</label>
                          <input 
                              type="number" required
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newSurvey.price || ''}
                              onChange={e => setNewSurvey({...newSurvey, price: Number(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Reporter</label>
                          <input 
                              type="text"
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                              value={newSurvey.reporter || ''}
                              onChange={e => setNewSurvey({...newSurvey, reporter: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Catatan Tambahan</label>
                          <textarea 
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm h-20"
                              placeholder="Kondisi pasar, stok, dll"
                              value={newSurvey.notes || ''}
                              onChange={e => setNewSurvey({...newSurvey, notes: e.target.value})}
                          />
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => setShowSurveyModal(false)} className="flex-1 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5">Batal</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default MarketAnalysis;
