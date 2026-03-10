import React from 'react';
import { BadgeCheck, Clock, Wallet, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: "Harian & Segar",
      desc: "Daging segar setiap hari.",
      color: "text-black"
    },
    {
      icon: BadgeCheck,
      title: "Sertifikasi Halal",
      desc: "Terjamin kehalalannya.",
      color: "text-black"
    },
    {
      icon: Wallet,
      title: "Harga Kompetitif",
      desc: "Harga terbaik untuk Anda.",
      color: "text-black"
    },
    {
      icon: ShieldCheck,
      title: "Layanan B2B",
      desc: "Solusi untuk bisnis Anda.",
      color: "text-black"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full border border-black flex items-center justify-center mb-4 hover:bg-black hover:text-white transition-all duration-300">
                <feature.icon size={32} />
              </div>
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">{feature.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
