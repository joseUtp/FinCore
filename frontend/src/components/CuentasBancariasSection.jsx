import React, { useState, useEffect } from 'react';
import { Landmark, Plus, DollarSign, CreditCard } from 'lucide-react';

const CuentasBancariasSection = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [banco, setBanco] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [cci, setCci] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cuentas-bancarias');
      if (!res.ok) throw new Error('Error al obtener cuentas');
      const data = await res.json();
      setCuentas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    const payload = {
      banco,
      numeroCuenta,
      cci,
      moneda,
      saldoInicial: parseFloat(saldoInicial)
    };

    try {
      const res = await fetch('/api/cuentas-bancarias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al guardar la cuenta');
      }

      setSuccessMsg('Cuenta bancaria registrada exitosamente.');
      setBanco('');
      setNumeroCuenta('');
      setCci('');
      setMoneda('PEN');
      setSaldoInicial('');
      fetchCuentas();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de registro */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-6">
            <Landmark className="w-5 h-5 text-zinc-800" />
            <h2 className="text-lg font-bold text-zinc-900">Registrar Cuenta Bancaria</h2>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Banco</label>
              <input 
                type="text" 
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="Ej. BCP, BBVA, Interbank"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Número de Cuenta</label>
              <input 
                type="text" 
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
                placeholder="Ej. 191-XXXXXXXX-X-XX"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Código de Cuenta Interbancario (CCI)</label>
              <input 
                type="text" 
                value={cci}
                onChange={(e) => setCci(e.target.value)}
                placeholder="20 dígitos"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Moneda</label>
                <select 
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  required
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Saldo Inicial</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-zinc-950 text-white hover:bg-zinc-800 py-2.5 rounded-xl shadow-sm text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
            >
              Registrar Cuenta
            </button>
          </form>
        </div>

        {/* Listado de cuentas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Listado de Cuentas Bancarias</h2>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-500 font-medium">
              Cargando cuentas...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-rose-500 font-medium">
              {error}
            </div>
          ) : cuentas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-400 font-medium">
              No hay cuentas bancarias registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cuentas.map((c) => (
                <div key={c.id} className="p-5 border border-zinc-100 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-200 transition-all shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-zinc-900 text-white rounded-xl">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-800">{c.banco}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200/60 text-zinc-600">
                            {c.moneda}
                          </span>
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${c.estado ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Nº de Cuenta</p>
                      <p className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        {c.numeroCuenta}
                      </p>
                      {c.cci && (
                        <>
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase mt-2">CCI</p>
                          <p className="text-xs font-semibold text-zinc-600">{c.cci}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 mt-5 pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Saldo Actual</p>
                      <p className="text-lg font-bold text-zinc-950">
                        {c.moneda === 'PEN' ? 'S/ ' : '$ '}
                        {c.saldoActual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuentasBancariasSection;
