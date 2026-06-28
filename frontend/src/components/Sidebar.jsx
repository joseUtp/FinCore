import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  RefreshCw, 
  BarChart3, 
  Users, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingresos', name: 'Ingresos', icon: TrendingUp },
    { id: 'egresos', name: 'Egresos', icon: TrendingDown },
    { id: 'cuentas', name: 'Cuentas Bancarias', icon: Landmark },
    { id: 'conciliacion', name: 'Conciliación', icon: RefreshCw },
    { id: 'reportes', name: 'Reportes', icon: BarChart3 },
    { id: 'usuarios', name: 'Usuarios', icon: Users },
    { id: 'configuracion', name: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0B0B] text-zinc-400 flex flex-col h-screen fixed left-0 top-0 border-r border-zinc-800 z-10">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-900">
        <h1 className="text-xl font-bold text-white tracking-wider">PROYECTO</h1>
      </div>
      
      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow-md' 
                  : 'hover:text-white hover:bg-zinc-900/50 text-zinc-400'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-900 text-xs text-zinc-600 text-center">
        FinCore v0.0.1
      </div>
    </aside>
  );
};

export default Sidebar;
