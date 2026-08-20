import { useState } from 'react';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function Configuracion() {
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem' }}>
        Configuración
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Perfil (Solo Lectura) */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Perfil de Usuario</h3>
          <p style={cardSubtitleStyle}>Tu información personal básica (Solo lectura).</p>
          
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <div style={inputWrapperStyle}>
                <User size={16} color="#94a3b8" />
                <input type="text" value="Administrador EnergiAI" readOnly style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <div style={inputWrapperStyle}>
                <Mail size={16} color="#94a3b8" />
                <input type="email" value="admin@energia.com" readOnly style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Seguridad</h3>
          <p style={cardSubtitleStyle}>Actualiza tu contraseña para mantener tu cuenta segura.</p>
          
          <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Contraseña actual</label>
              <div style={inputWrapperStyle}>
                <Lock size={16} color="#94a3b8" />
                <input type="password" placeholder="••••••••" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nueva contraseña</label>
              <div style={inputWrapperStyle}>
                <Lock size={16} color="#94a3b8" />
                <input type="password" placeholder="••••••••" required style={inputStyle} />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Guardar cambios
              </button>
              {success && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>
                  <CheckCircle2 size={16} /> Contraseña actualizada
                </span>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

// Estilos
const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const cardTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: 0,
};

const cardSubtitleStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  margin: '0.25rem 0 0 0',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '0.35rem',
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  padding: '0.65rem 0.75rem',
};

const inputStyle = {
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  outline: 'none',
  fontSize: '0.9rem',
  color: '#0f172a',
};
