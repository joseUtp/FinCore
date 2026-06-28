import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/recent-transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] animate-pulse h-48"></div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Últimas Transacciones</h2>
        <button className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Descripción</th>
              <th className="pb-3 font-medium">Tipo</th>
              <th className="pb-3 font-medium text-right">Monto</th>
              <th className="pb-3 font-medium text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 text-sm">
            {transactions.map((tx, idx) => (
              <tr 
                key={idx} 
                className="group hover:bg-zinc-50/50 transition-colors duration-150"
              >
                <td className="py-4 text-zinc-500 font-medium">{tx.date}</td>
                <td className="py-4 font-semibold text-zinc-800">{tx.description}</td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    tx.isIncome 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {tx.isIncome ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {tx.type}
                  </span>
                </td>
                <td className={`py-4 text-right font-bold ${
                  tx.isIncome ? 'text-emerald-600' : 'text-zinc-900'
                }`}>
                  {tx.isIncome ? '+' : '-'} S/ {tx.amount}
                </td>
                <td className="py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    tx.status === 'Completado'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}>
                    {tx.status === 'Completado' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
