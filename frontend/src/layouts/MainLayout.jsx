import { useState, useEffect } from 'react';
import SideBar from '@/components/SideBar';
import { Menu, User, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { consultarVinculacionTelegram } from '@/services/telegramService';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estado para Telegram y Usuario
  const [telegramStatus, setTelegramStatus] = useState('unlinked'); // 'unlinked', 'pending', 'linked'
  const [sessionId, setSessionId] = useState(null);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    // Al cargar, revisar si ya está vinculado o en progreso
    const storedSessionId = localStorage.getItem('telegramSessionId');
    const isLinked = localStorage.getItem('telegramLinked') === 'true';

    if (isLinked && storedSessionId) {
      setTelegramStatus('linked');
      setSessionId(storedSessionId);
      
      // Verificar silenciosamente si el backend aún tiene la sesión (ej. tras reinicio)
      consultarVinculacionTelegram(storedSessionId).then(valid => {
        if (!valid) {
          setTelegramStatus('unlinked');
          localStorage.removeItem('telegramLinked');
          localStorage.removeItem('telegramSessionId');
        }
      }).catch(() => {});
    } else if (storedSessionId) {
      setTelegramStatus('pending');
      setSessionId(storedSessionId);
    }

    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  useEffect(() => {
    // Polling si está en pending
    let intervalId;
    if (telegramStatus === 'pending' && sessionId) {
      intervalId = setInterval(async () => {
        const vinculado = await consultarVinculacionTelegram(sessionId);
        if (vinculado) {
          setTelegramStatus('linked');
          localStorage.setItem('telegramLinked', 'true');
          clearInterval(intervalId);
        }
      }, 3000); // Poll cada 3 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [telegramStatus, sessionId]);

  const handleLinkTelegram = () => {
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      setSessionId(currentSessionId);
      localStorage.setItem('telegramSessionId', currentSessionId);
    }
    
    setTelegramStatus('pending');
    
    // Cambia el nombre de usuario del bot según tu configuración en application.properties
    const botUsername = 'EnergiAI_27_bot';
    window.open(`https://t.me/${botUsername}?start=${currentSessionId}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar 
        isOpen={isSidebarOpen} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ 
          height: '64px', 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '0.375rem',
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Telegram Integration Button */}
            {telegramStatus === 'unlinked' && (
              <button
                onClick={handleLinkTelegram}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
              >
                <Send size={14} />
                <span>Vincular Telegram</span>
              </button>
            )}

            {telegramStatus === 'pending' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: '500',
              }}>
                <Loader2 size={14} className="animate-spin" />
                <span>Esperando confirmación...</span>
              </div>
            )}

            {telegramStatus === 'linked' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}>
                <CheckCircle2 size={14} />
                <span>Telegram vinculado</span>
              </div>
            )}

            <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>Hola, {userName}</span>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9', 
              border: '1px solid #e2e8f0',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <User size={18} color="#64748b" />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}