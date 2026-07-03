import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Landmark, Calendar, User, FileUp, List } from 'lucide-react';

const TransaccionesFormSection = ({ tipo }) => {
  const [transacciones, setTransacciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [descripcion, setDescripcion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cuentaBancariaId, setCuentaBancariaId] = useState('');
  const [comprobante, setComprobante] = useState(null);
  
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTransacciones();
    fetchAuxiliaryData();
  }, [tipo]);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transacciones');
      if (!res.ok) throw new Error('Error al obtener transacciones');
      const data = await res.json();
      setTransacciones(data.filter(t => t.tipo === tipo));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const accountsRes = await fetch('/api/cuentas-bancarias');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setCuentas(accountsData);
        if (accountsData.length > 0) setCuentaBancariaId(accountsData[0].id);
      }

      const catRes = await fetch(`/api/categorias?tipo=${tipo}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategorias(catData);
        if (catData.length > 0) setCategoriaId(catData[0].id);
      }

      if (tipo === 'INGRESO') {
        const clientRes = await fetch('/api/clientes');
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          setClientes(clientData);
          if (clientData.length > 0) setClienteId(clientData[0].id);
        }
      } else {
        const provRes = await fetch('/api/proveedores');
        if (provRes.ok) {
          const provData = await provRes.json();
          setProveedores(provData);
          if (provData.length > 0) setProveedorId(provData[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching auxiliary data:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('fecha', fecha);
    formData.append('monto', parseFloat(monto));
    formData.append('moneda', moneda);
    formData.append('categoriaId', parseInt(categoriaId));
    formData.append('cuentaBancariaId', parseInt(cuentaBancariaId));
    
    if (descripcion) formData.append('descripcion', descripcion);
    if (referencia) formData.append('referencia', referencia);
    
    if (tipo === 'INGRESO' && clienteId) {
      formData.append('clienteId', parseInt(clienteId));
    } else if (tipo === 'EGRESO' && proveedorId) {
      formData.append('proveedorId', parseInt(proveedorId));
    }
    
    if (comprobante) {
      formData.append('comprobante', comprobante);
    }

    try {
      const res = await fetch('/api/transacciones', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al guardar la transacción');
      }

      setSuccessMsg('Transacción registrada correctamente.');
      setMonto('');
      setDescripcion('');
      setReferencia('');
      setComprobante(null);
      
      const fileInput = document.getElementById('comprobante-input');
      if (fileInput) fileInput.value = '';

      fetchTransacciones();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="w-5 h-5 text-zinc-800" />
            <h2 className="text-lg font-bold text-zinc-900">Registrar {tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}</h2>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Monto</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  required
                />
              </div>
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
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Categoría</label>
                <select 
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  required
                >
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Cuenta Bancaria</label>
              <select 
                value={cuentaBancariaId}
                onChange={(e) => setCuentaBancariaId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              >
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.banco} - {c.numeroCuenta} ({c.moneda})</option>
                ))}
              </select>
            </div>

            {tipo === 'INGRESO' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Cliente</label>
                <select 
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                >
                  <option value="">-- Seleccionar Cliente (Opcional) --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.razonSocial} (RUC: {c.ruc})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Proveedor</label>
                <select 
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                >
                  <option value="">-- Seleccionar Proveedor (Opcional) --</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.razonSocial} (RUC: {p.ruc})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Referencia / Código Operación</label>
              <input 
                type="text" 
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. OP-9872"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Descripción</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalle de la transacción..."
                rows="2"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                <FileUp className="w-3.5 h-3.5" />
                Adjuntar Comprobante (PDF, JPG, PNG)
              </label>
              <input 
                type="file" 
                id="comprobante-input"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800"
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-zinc-950 text-white hover:bg-zinc-800 py-2.5 rounded-xl shadow-sm text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
            >
              Registrar {tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
            </button>
          </form>
        </div>

        {/* Listado */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <List className="w-5 h-5 text-zinc-800" />
            <h2 className="text-lg font-bold text-zinc-900">Transacciones de {tipo === 'INGRESO' ? 'Ingresos' : 'Egresos'} Registradas</h2>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-500 font-medium">
              Cargando historial...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-rose-500 font-medium">
              {error}
            </div>
          ) : transacciones.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-400 font-medium">
              No hay transacciones registradas de este tipo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Categoría</th>
                    <th className="pb-3 font-medium">Cuenta / Ref</th>
                    <th className="pb-3 font-medium">Monto</th>
                    <th className="pb-3 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-sm">
                  {transacciones.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 font-semibold text-zinc-800">{tx.fecha}</td>
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-zinc-800">{tx.categoria?.nombre}</p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{tx.descripcion || 'Sin descripción'}</p>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-500">
                        <div>
                          <p className="font-medium text-zinc-700">{tx.cuentaBancaria?.banco}</p>
                          <p className="text-[10px] text-zinc-400">{tx.referencia || 'Sin referencia'}</p>
                        </div>
                      </td>
                      <td className={`py-4 font-bold ${tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tipo === 'INGRESO' ? '+' : '-'} {tx.moneda === 'PEN' ? 'S/ ' : '$ '}
                        {tx.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.estado === 'CONCILIADO' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : tx.estado === 'PENDIENTE_CONCILIACION'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.estado.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransaccionesFormSection;
