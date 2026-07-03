import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sesión');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Elementos visuales de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-zinc-800 rounded-2xl border border-zinc-700/50 mb-2">
            <span className="text-xl font-black text-white tracking-widest">FC</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido a FinCore</h1>
          <p className="text-zinc-500 text-xs font-medium">Gestiona las finanzas de CodeNetSolutions S.A.C.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@codenetsolutions.com"
                className="w-full text-xs text-white pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-zinc-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs text-white pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-zinc-600"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-white text-zinc-950 hover:bg-zinc-100 disabled:bg-zinc-700 disabled:text-zinc-400 py-3 rounded-xl shadow-md text-xs font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-zinc-600 border-t border-zinc-800/80 pt-6">
          FinCore v0.0.1 • CodeNetSolutions
        </div>
      </div>
    </div>
  );
};

export default Login;
