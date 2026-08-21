import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import NuevoAnalisis from '@/pages/NuevoAnalisis';
import Historial from '@/pages/Historial';
import Comparacion from '@/pages/Comparacion';
import Simulador from '@/pages/Simulador';
import Ranking from '@/pages/Ranking';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Configuracion from '@/pages/Configuracion';
import CalculadoraSolar from '@/pages/CalculadoraSolar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const checkHash = () => {
      setAuthView(window.location.hash === '#register' ? 'register' : 'login');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register 
          onRegisterSuccess={() => setIsAuthenticated(true)} 
          onBackToLogin={() => { window.location.hash = ''; setAuthView('login'); }} 
        />
      );
    }
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo-analisis" element={<NuevoAnalisis />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/comparacion" element={<Comparacion />} />
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/calculadora-solar" element={<CalculadoraSolar />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </MainLayout>
  );
}