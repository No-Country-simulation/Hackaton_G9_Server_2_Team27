import { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Como es solo maqueta/cáscara, simulamos el ingreso exitoso
    console.log('Intento de login con:', { email, password });
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={logoBadgeStyle}>
            <Zap size={28} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.75rem' }}>
            EnergiAI
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Ingresa a tu cuenta para gestionar el consumo energético
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Campo Email */}
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={labelStyle}>Contraseña</label>
              <a href="#forgot" style={{ fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', fontWeight: '500' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div style={inputWrapperStyle}>
              <Lock size={18} color="#94a3b8" style={{ marginLeft: '0.75rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Botón de Ingreso */}
          <button type="submit" style={submitButtonStyle}>
            <span>Iniciar sesión</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer del Login */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          ¿No tienes una cuenta?{' '}
          <a href="#register" style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}>
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}

// Estilos específicos para la vista de Login
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
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
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
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  marginTop: '0.35rem',
  overflow: 'hidden',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 0.75rem',
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