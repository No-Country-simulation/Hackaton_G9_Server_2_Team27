import { ArrowDown } from 'lucide-react';
import { ui, theme } from '@/styles/theme';

export default function Comparacion() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={ui.pageTitle}>4. Comparación entre períodos</h2>

      {/* Selectores de Período */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: theme.colors.textMuted }}>Período A</label>
          <select style={{ ...ui.input, marginTop: '0.25rem' }}>
            <option>Julio / 2026</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: theme.colors.textMuted }}>Período B</label>
          <select style={{ ...ui.input, marginTop: '0.25rem' }}>
            <option>Junio / 2026</option>
          </select>
        </div>
        <button style={ui.btnPrimary}>Comparar</button>
      </div>

      {/* Grid de Métricas Comparativas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Consumo total</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>420 kWh</div>
          <div style={{ fontSize: '0.85rem', color: theme.colors.primary, fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <ArrowDown size={16} /> 16%
          </div>
        </div>

        <div style={{ ...ui.card, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Costo estimado</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>R$ 315,00</div>
          <div style={{ fontSize: '0.85rem', color: theme.colors.primary, fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <ArrowDown size={16} /> 16%
          </div>
        </div>

        <div style={{ ...ui.card, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Categoría</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#dc2626' }}>Ineficiente vs Ineficiente</div>
        </div>

        <div style={{ ...ui.card, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Ahorro</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: theme.colors.primary }}>R$ 60,00</div>
          <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Julio vs Junio</span>
        </div>
      </div>

      {/* Gráfico comparativo por semanas */}
      <div style={ui.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Consumo (kWh)</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: theme.colors.primary }}>■ Julio / 2026</span>
            <span style={{ color: '#94a3b8' }}>■ Junio / 2026</span>
          </div>
        </div>

        <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 2rem' }}>
          {[1, 2, 3, 4, 5].map((w) => (
            <div key={w} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', textAlign: 'center' }}>
              <div style={{ width: '28px', height: `${120 + w * 10}px`, backgroundColor: theme.colors.primary, borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ width: '28px', height: `${90 + w * 8}px`, backgroundColor: '#cbd5e1', borderRadius: '4px 4px 0 0' }}></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: theme.colors.textMuted }}>
          <span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span><span>Semana 5</span>
        </div>
      </div>
    </div>
  );
}