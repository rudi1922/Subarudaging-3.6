import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Pastikan library ini sesuai dengan yang Anda install (biasanya framer-motion)
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      // Menggunakan import.meta.env untuk Vite
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      
      // Inisialisasi model dengan instruksi sistem
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `Anda adalah asisten virtual ahli untuk 'Subaru Daging Sapi'. Anda ramah, profesional, dan memiliki pengetahuan mendalam tentang industri daging.
          
PENTING: Berikan jawaban yang SINGKAT, PADAT, dan LANGSUNG PADA INTI. Jangan memberikan penjelasan yang terlalu panjang kecuali diminta.

Kamus & Pengetahuan Produk:
- Karkas: Seluruh tubuh sapi setelah disembelih, dikuliti, dan dibersihkan jeroannya.
- Sirloin (Has Luar): Daging dari bagian punggung belakang, memiliki lapisan lemak di satu sisi yang memberikan rasa gurih.
- Tenderloin (Has Dalam): Bagian paling empuk karena otot ini jarang bekerja. Sangat sedikit lemak.
- Ribeye: Daging dari sekitar tulang rusuk, memiliki marbling (lemak dalam daging) yang tinggi, sangat juicy.
- Knuckle (Kelapa): Bagian paha belakang atas, cocok untuk rendang atau empal.
- Chuck (Sampil): Bagian paha, cocok untuk bakso atau semur.
- Brisket (Sandung Lamur): Bagian dada bawah, berlemak, cocok untuk soto atau rawon.

Informasi Bisnis:
- Harga: Sirloin/Ribeye (135rb-150rb/kg), Tenderloin (160rb/kg), Daging Rendang (120rb-130rb/kg).
- Lokasi: Gerai Tamin, Gerai Way Halim, dan RPH.
- Jam Operasional: 08:00 - 20:00 (Setiap Hari).
- Keunggulan: Daging segar (fresh cut), Halal, dan higienis.

Tugas Anda:
1. Jawab pertanyaan tentang potongan daging & kegunaannya.
2. Berikan estimasi harga.
3. Informasikan lokasi dan jam buka.
4. Jika di luar topik daging sapi, arahkan kembali dengan sopan ke Subaru Daging Sapi.`,
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Maaf, saya tidak bisa merespons saat ini. Pastikan koneksi internet Anda stabil." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
        title="Tanya Subaru AI"
      >
        <div className="absolute -top-12 right-0 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100">
          Butuh bantuan? Tanya AI kami!
          <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45"></div>
        </div>
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#050505] animate-pulse"></span>
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
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-bold">Subaru Daging Sapi AI</div>
                  <div className="text-[10px] text-white/70 uppercase tracking-widest">Online Assistant</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-700 text-white rounded-tr-none shadow-sm' 
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-red-700" />
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
                  placeholder="Tanyakan sesuatu..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-700 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-red-700 text-white rounded-xl hover:bg-red-800 disabled:opacity-50 transition-colors"
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
