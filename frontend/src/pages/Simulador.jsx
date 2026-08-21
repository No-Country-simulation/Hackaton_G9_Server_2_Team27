import { useState } from 'react';
import { Info } from 'lucide-react';
import { ui, theme } from '@/styles/theme';

export default function Simulador() {
  const [horasReduccion, setHorasReduccion] = useState(2);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={ui.pageTitle}>5. Simulación de escenarios de ahorro</h2>

      <div style={ui.card}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Reducir horas de uso diario en horarios pico</h3>

        {/* Range Slider */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Horas de reducción por día</label>
            <span style={{ backgroundColor: theme.colors.primary, color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{horasReduccion} horas</span>
          </div>
          <input 
            type="range" min="0" max="8" value={horasReduccion}
            onChange={(e) => setHorasReduccion(e.target.value)}
            style={{ width: '100%', accentColor: theme.colors.primary }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.colors.textMuted, marginTop: '0.25rem' }}>
            <span>0</span><span>8</span>
          </div>
        </div>

        {/* Muestras de Resultados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Consumo actual</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>420</div>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>kWh</span>
          </div>
          <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Consumo estimado</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{420 - (horasReduccion * 30)}</div>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>kWh</span>
          </div>
          <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Ahorro mensual</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{horasReduccion * 30}</div>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>kWh</span>
          </div>
          <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Ahorro económico</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.primary, margin: '0.25rem 0' }}>R$ {(horasReduccion * 30 * 0.75).toFixed(2)}</div>
          </div>
        </div>

        <div style={ui.infoBanner}>
          <Info size={18} />
          <span>Estos valores son estimados y pueden variar según su perfil de consumo real.</span>
        </div>
      </div>
    </div>
  );
}