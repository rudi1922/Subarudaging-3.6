import React from 'react';
import { BadgeCheck, Building, Clock, Wallet } from 'lucide-react';

const Stats: React.FC = () => {
  const stats = [
    { label: 'Jaminan Halal', val: '100%', icon: BadgeCheck },
    { label: 'Mitra Horeca', val: '150+', icon: Building },
    { label: 'Freshness', val: '24H', icon: Clock },
    { label: 'Best Price', val: 'Grosir', icon: Wallet }
  ];

  return (
    <div className="relative z-20 -mt-20 max-w-6xl mx-auto px-6">
      <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
        {stats.map((stat, i) => (
          <div key={i} className="text-center group px-4 first:border-l-0 border-l border-white/5">
            <stat.icon className="w-6 h-6 mx-auto mb-3 text-brand-gold/50 group-hover:text-brand-gold transition-colors" />
            <p className="text-2xl font-serif font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">{stat.val}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
