import { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: formData.nombre,
          email: formData.email, 
          password: formData.password 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status}) al registrar usuario`);
      }

      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      console.error('Error real capturado:', error);
      setErrorMsg(error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={logoBadgeStyle}>
            <Zap size={28} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.75rem' }}>
            Crea tu cuenta
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Únete a EnergiAI y optimiza tu consumo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* Campo Nombre */}
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <div style={inputWrapperStyle}>
              <User size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type="text"
                name="nombre"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Campo Email */}
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Contraseña */}
          <div>
            <label style={labelStyle}>Confirmar Contraseña</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Botón de Registro */}
          <button type="submit" style={submitButtonStyle} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /><span>Registrando...</span></>
            ) : (
              <><span>Registrarse</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Footer del Registro */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            onClick={onBackToLogin || (() => window.location.hash = '')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} />
            <span>Volver a Iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos
const pageContainerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  width: '100%',
  maxWidth: '420px',
  borderRadius: '1rem',
  padding: '2.5rem 2rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
};

const logoBadgeStyle = {
  backgroundColor: '#f0fdf4',
  width: '52px',
  height: '52px',
  borderRadius: '0.75rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #dcfce7',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '500',
  color: '#334155',
  marginBottom: '0.35rem',
  display: 'block'
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: 'none',
  backgroundColor: 'transparent',
  outline: 'none',
  fontSize: '0.9rem',
  color: '#0f172a',
};

const eyeButtonStyle = {
  background: 'none',
  border: 'none',
  paddingRight: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const submitButtonStyle = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  border: 'none',
  padding: '0.85rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  fontSize: '0.95rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)',
};
