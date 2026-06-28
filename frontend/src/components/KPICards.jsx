import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';

const iconMap = {
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  Wallet: Wallet,
  Activity: Activity
};

const KPICards = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setCardsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 h-32 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardsData.map((card, idx) => {
        const Icon = iconMap[card.iconName] || Activity;
        return (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-zinc-500">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            
            <div className="mb-2">
              <span className="text-2xl font-semibold text-zinc-950 tracking-tight">
                {card.isCurrency ? (
                  <>
                    <span className="text-zinc-500 font-normal mr-1.5">S/</span>
                    {card.value}
                  </>
                ) : (
                  card.value
                )}
              </span>
            </div>
            
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                card.isPositive 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
