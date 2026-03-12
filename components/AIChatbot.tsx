import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient'; // Sesuaikan folder jika file ini ada di folder 'lib'

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
      // 1. Ambil data produk dari Supabase
      const { data: produkTerbaru, error: dbError } = await supabase
        .from('products')
        .select('name, cost_price');

      if (dbError) console.warn("Gagal mengambil data produk:", dbError.message);

      // 2. Format data produk untuk AI
      const infoStok = produkTerbaru && produkTerbaru.length > 0
        ? produkTerbaru.map(p => `- ${p.name}: Rp${p.cost_price?.toLocaleString('id-ID')}/kg`).join('\n')
        : "Saat ini informasi stok belum tersedia di sistem kami.";

      // 3. Panggil Gemini AI
      // Pastikan VITE_GEMINI_API_KEY sudah diset di Vercel
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key tidak ditemukan di environment variables");
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash" 
      });

      // 4. Instruksi Sistem (Otak AI)
      const systemInstruction = `Anda adalah asisten virtual ahli untuk 'Subaru Daging Sapi'.
      
DATA STOK REAL-TIME DI TOKO:
${infoStok}

INFORMASI PENTING:
- Lokasi Gerai: Tamin (Pusat), Way Halim, dan RPH.
- Jam Operasional: 08:00 - 20:00 (Setiap Hari).
- Karakter: Ramah, profesional, dan gunakan bahasa Indonesia yang sopan.
- Jawablah dengan singkat dan padat. Jika ditanya stok yang tidak ada di data, sarankan pelanggan untuk menghubungi admin lewat WhatsApp.`;

      // 5. Jalankan Chat
      const result = await model.generateContent([systemInstruction, userMessage]);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);

    } catch (error) {
      console.error('AI Chat Error:', error);
      let errorMessage = "Maaf, Subaru AI sedang mengalami gangguan. Silakan coba lagi nanti.";
      
      if (error instanceof Error && error.message.includes("API Key")) {
        errorMessage = "Konfigurasi AI belum lengkap. Mohon hubungi teknisi (Cek API Key di Vercel).";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorMessage }]);
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
            <div className="bg-red-700 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-bold">Subaru Daging Sapi AI</div>
                  <div className="text-[10px] text-white/70 uppercase font-medium">Online Assistant</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none shadow-md' 
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
                    <span className="text-xs text-gray-400 font-medium">Subaru sedang mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanyakan stok daging..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-600 transition-all outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-200"
                >
                  <Send size={18} />
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
