import { useState } from 'react';
import SideBar from '@/components/SideBar';
import { Menu, User } from 'lucide-react';

export default function MainLayout({ children, currentRoute, onNavigate }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar 
        isOpen={isSidebarOpen} 
        activeRoute={currentRoute} 
        onNavigate={onNavigate} 
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>Hola, Usuario</span>
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