import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const UsuariosSection = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0) setRolId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage('');

    const payload = {
      nombre,
      correo,
      password,
      rolId: parseInt(rolId),
      estado
    };

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        setFormErrors(data);
        return;
      }

      setSuccessMessage('Usuario creado exitosamente.');
      setNombre('');
      setCorreo('');
      setPassword('');
      if (roles.length > 0) setRolId(roles[0].id);
      setEstado('ACTIVO');
      fetchUsuarios();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccessMessage('Usuario eliminado correctamente.');
        fetchUsuarios();
      } else {
        alert('No se pudo eliminar el usuario.');
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create User Form */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-zinc-800" />
            <h2 className="text-lg font-bold text-zinc-900">Registrar Nuevo Usuario</h2>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              />
              {formErrors.nombre && <p className="text-[10px] text-rose-500 mt-1">{formErrors.nombre}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="juan@codenetsolutions.com"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              />
              {formErrors.correo && <p className="text-[10px] text-rose-500 mt-1">{formErrors.correo}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              />
              {formErrors.password && <p className="text-[10px] text-rose-500 mt-1">{formErrors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Rol</label>
              <select 
                value={rolId}
                onChange={(e) => setRolId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre} - {r.descripcion}</option>
                ))}
              </select>
              {formErrors.rolId && <p className="text-[10px] text-rose-500 mt-1">{formErrors.rolId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Estado</label>
              <select 
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                required
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="BLOQUEADO">BLOQUEADO</option>
              </select>
              {formErrors.estado && <p className="text-[10px] text-rose-500 mt-1">{formErrors.estado}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-zinc-950 text-white hover:bg-zinc-800 py-2.5 rounded-xl shadow-sm text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
            >
              Registrar Usuario
            </button>
          </form>
        </div>

        {/* Right Side: Users List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Listado de Usuarios</h2>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-500 font-medium">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-rose-500 font-medium">
              {error}
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-zinc-400 font-medium">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Correo</th>
                    <th className="pb-3 font-medium">Rol</th>
                    <th className="pb-3 font-medium text-center">Estado</th>
                    <th className="pb-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-sm">
                  {usuarios.map((usr) => (
                    <tr key={usr.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 font-semibold text-zinc-800">{usr.nombre}</td>
                      <td className="py-4 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          {usr.correo}
                        </span>
                      </td>
                      <td className="py-4 text-zinc-600">
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-zinc-400" />
                          {usr.rol?.nombre}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          usr.estado === 'ACTIVO' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : usr.estado === 'INACTIVO'
                            ? 'bg-zinc-100 text-zinc-600'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {usr.estado === 'ACTIVO' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {usr.estado}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDelete(usr.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

export default UsuariosSection;
