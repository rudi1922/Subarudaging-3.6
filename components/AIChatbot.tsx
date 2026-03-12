import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Halo! Saya asisten virtual Subaru Daging Sapi. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Ambil data produk terbaru dari Supabase
      const { data: produkTerbaru } = await supabase
        .from('products')
        .select('name, cost_price');

      // 2. Format data produk untuk AI
      const infoStok = produkTerbaru && produkTerbaru.length > 0
        ? produkTerbaru.map(p => `- ${p.name}: Rp${p.cost_price?.toLocaleString('id-ID')}/kg`).join('\n')
        : "Data stok saat ini belum tersedia di database.";

      // 3. Inisialisasi Google AI
      const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      // 4. Set instruksi sistem dan kirim pesan
      const systemInstruction = `Anda adalah asisten virtual ahli untuk 'Subaru Daging Sapi'. Anda ramah, profesional, dan SINGKAT dalam menjawab.
      
DATA STOK REAL-TIME SAAT INI:
${infoStok}

PENGETAHUAN PRODUK:
- Karkas: Seluruh tubuh sapi (bersih jeroan).
- Sirloin (Has Luar): Punggung belakang, gurih berlemak.
- Tenderloin (Has Dalam): Paling empuk, sedikit lemak.
- Lokasi: Gerai Tamin (Pusat), Gerai Way Halim, dan RPH.
- Jam Operasional: 08:00 - 20:00.

TUGAS ANDA:
- Jawab pertanyaan berdasarkan data stok di atas. 
- Jika stok tidak ada di daftar, sarankan pelanggan untuk menanyakan ketersediaan besok pagi.
- Berikan tips memasak singkat jika ditanya jenis daging tertentu.`;

      const result = await model.generateContent([systemInstruction, userMessage]);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Maaf, Subaru AI sedang tidak bisa merespons. Pastikan API Key sudah terpasang di Vercel." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <MessageSquare size={24} />
        <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-red-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot size={20} />
                <div>
                  <div className="font-bold">Subaru Daging Sapi AI</div>
                  <div className="text-[10px] text-white/70 uppercase">Online Assistant</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-red-600" />
                    <span className="text-xs text-gray-400">Subaru sedang mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanyakan stok daging..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-600 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
