import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ChartsSection = () => {
  const [data, setData] = useState([]);
  const [expensesDistribution, setExpensesDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/charts')
      .then(res => res.json())
      .then(result => {
        setData(result.monthly || []);
        setExpensesDistribution(result.expensesDistribution || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching charts data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 bg-white p-6 h-80 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]"></div>
        <div className="bg-white p-6 h-80 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]"></div>
      </div>
    );
  }

  // Custom tooltip for Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0B0B] text-white p-3 rounded-xl border border-zinc-800 shadow-xl text-xs">
          <p className="font-semibold mb-1.5 text-zinc-300">{label}</p>
          <p className="text-emerald-400 flex justify-between gap-4">
            <span>Ingresos:</span>
            <span className="font-semibold">S/ {payload[0].value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </p>
          <p className="text-rose-400 flex justify-between gap-4">
            <span>Egresos:</span>
            <span className="font-semibold">S/ {payload[1].value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ingresos vs Egresos Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Ingresos vs Egresos Mensual</h2>
          <div className="flex gap-4 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ingresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Egresos
            </span>
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717A', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717A', fontSize: 12 }}
                tickFormatter={(val) => `S/ ${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar 
                dataKey="Ingresos" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
              <Bar 
                dataKey="Egresos" 
                fill="#FB7185" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución de Gastos */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Distribución de Gastos</h2>
          
          <div className="space-y-5">
            {expensesDistribution.map((item, idx) => (
              <div key={idx} className="pb-4 border-b border-zinc-50 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-sm font-medium text-zinc-700">{item.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{item.percentage}%</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Simple summary card at the bottom */}
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100/50 mt-6 flex justify-between items-center text-xs">
          <span className="text-zinc-500">Gastos Totales Registrados</span>
          <span className="font-semibold text-zinc-800">S/ 78,250.00</span>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
