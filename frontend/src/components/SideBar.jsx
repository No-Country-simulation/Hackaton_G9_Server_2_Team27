import { 
  Zap, 
  PlusCircle, 
  History, 
  BarChart2, 
  SlidersHorizontal, 
  Trophy, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const MODULOS = [
  { id: 1, nombre: 'Dashboard', ruta: '/', icon: Zap },
  { id: 2, nombre: 'Nuevo análisis', ruta: '/nuevo-analisis', icon: PlusCircle },
  { id: 3, nombre: 'Historial', ruta: '/historial', icon: History },
  { id: 4, nombre: 'Comparación', ruta: '/comparacion', icon: BarChart2 },
  { id: 5, nombre: 'Simulador', ruta: '/simulador', icon: SlidersHorizontal },
  { id: 6, nombre: 'Ranking', ruta: '/ranking', icon: Trophy },
  { id: 7, nombre: 'Configuración', ruta: '/configuracion', icon: Settings },
];

export default function SideBar({ isOpen = true }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <aside style={{ 
      width: '240px', 
      backgroundColor: '#ffffff', 
      borderRight: '1px solid #e2e8f0', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      position: 'sticky', 
      top: 0,
      flexShrink: 0
    }}>
      {/* Brand Logo */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>EnergiAI</h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 1rem' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {MODULOS.map((item) => {
            const isActive = location.pathname === item.ruta;
            const IconComponent = item.icon;

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.ruta)}
                  style={{
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '400',
                    backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                    color: isActive ? '#16a34a' : '#64748b',
                    textAlign: 'left'
                  }}
                >
                  <IconComponent size={18} color={isActive ? '#16a34a' : '#64748b'} />
                  <span>{item.nombre}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Option */}
      <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.9rem' }}
        >
          <LogOut size={18} color="#64748b" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}