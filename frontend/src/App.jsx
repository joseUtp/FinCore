import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import ChartsSection from './components/ChartsSection';
import TransactionsTable from './components/TransactionsTable';
import UsuariosSection from './components/UsuariosSection';
import CuentasBancariasSection from './components/CuentasBancariasSection';
import TransaccionesFormSection from './components/TransaccionesFormSection';
import Login from './components/Login';
import ReportesSection from './components/ReportesSection';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Calendar, 
  Plus,
  LogOut 
} from 'lucide-react';

// Interceptor global de fetch estático para evitar condiciones de carrera en el ciclo de vida de React
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  let finalUrl = url;
  if (url.startsWith('/api')) {
    finalUrl = `http://localhost:8080${url}`;
  }
  
  let token = null;
  try {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      token = JSON.parse(stored)?.token;
    }
  } catch (e) {
    console.error("Error al leer el token en el interceptor fetch:", e);
  }

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const res = await originalFetch(finalUrl, { ...options, headers });
    if (res.status === 401) {
      sessionStorage.removeItem('user');
      window.location.reload();
    }
    return res;
  } catch (err) {
    console.error("Fetch Interceptor Error:", err);
    throw err;
  }
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLoginSuccess = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <KPICards />
            
            {/* Charts Section */}
            <ChartsSection />
            
            {/* Transactions Table */}
            <TransactionsTable />
          </div>
        );
      case 'usuarios':
        return <UsuariosSection />;
      case 'cuentas':
        return <CuentasBancariasSection />;
      case 'reportes':
        return <ReportesSection />;
      case 'ingresos':
        return <TransaccionesFormSection tipo="INGRESO" />;
      case 'egresos':
        return <TransaccionesFormSection tipo="EGRESO" />;
      default:
        return (
          <div className="bg-white p-12 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] text-center py-20 animate-fade-in">
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-zinc-500 text-sm">
                Esta sección está siendo desarrollada. Aquí se gestionará la información correspondiente a {activeTab}.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans antialiased text-zinc-900">
      {/* Sidebar Navigation - Pasamos el rol del usuario */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.rol} />
      
      {/* Main Container */}
      <main className="flex-1 min-h-screen pl-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/60 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar transacción..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-200"></div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-200 flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                  {user.nombre.substring(0, 2)}
                </div>
                <div className="hidden sm:block text-left select-none">
                  <p className="text-xs font-semibold text-zinc-800 leading-tight">{user.nombre}</p>
                  <p className="text-[10px] text-zinc-400 font-medium capitalize">{user.rol.toLowerCase()}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Menu desplegable */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-zinc-200/80 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Correo</p>
                    <p className="text-xs text-zinc-600 truncate">{user.correo}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {/* Page Title & Main Action Button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight capitalize">{activeTab}</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Bienvenido, {user.nombre}. Panel de gestión financiera.
              </p>
            </div>
            
            {activeTab === 'dashboard' && (
              <button 
                onClick={() => setActiveTab('ingresos')}
                className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-4 py-2.5 rounded-xl shadow-sm text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Nueva Operación
              </button>
            )}
          </div>

          {/* Active section rendering */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
