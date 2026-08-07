import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import NuevoAnalisis from '@/pages/NuevoAnalisis';
import Historial from '@/pages/Historial';
import Comparacion from '@/pages/Comparacion';
import Simulador from '@/pages/Simulador';
import Ranking from '@/pages/Ranking';
import Login from '@/pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/');

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <MainLayout currentRoute={currentRoute} onNavigate={(route) => setCurrentRoute(route)}>
      {currentRoute === '/' && <Home />}
      {currentRoute === '/nuevo-analisis' && <NuevoAnalisis />}
      {currentRoute === '/historial' && <Historial />}
      {currentRoute === '/comparacion' && <Comparacion />}
      {currentRoute === '/simulador' && <Simulador />}
      {currentRoute === '/ranking' && <Ranking />}
    </MainLayout>
  );
}