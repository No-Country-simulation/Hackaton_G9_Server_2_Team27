import { Trophy, Info } from 'lucide-react';
import { ui, getBadgeStyle, theme } from '@/styles/theme';

export default function Ranking() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={ui.pageTitle}>6. Ranking de eficiencia energética</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '0.5rem' }}>
        <button style={{ background: 'none', border: 'none', borderBottom: `2px solid ${theme.colors.primary}`, paddingBottom: '0.5rem', fontWeight: 'bold', color: theme.colors.primary, cursor: 'pointer' }}>Geral</button>
        <button style={{ background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}>Empresas</button>
      </div>

      {/* Podio Top 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
        {/* Posición 2 */}
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <Trophy size={28} color="#94a3b8" style={{ margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Ana</h3>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>89 pts</span>
          <div style={{ marginTop: '0.5rem' }}><span style={getBadgeStyle('Eficiente')}>Eficiente</span></div>
        </div>

        {/* Posición 1 */}
        <div style={{ ...ui.card, textAlign: 'center', border: `2px solid ${theme.colors.primary}`, padding: '1.75rem 1.25rem' }}>
          <Trophy size={36} color="#eab308" style={{ margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Carlos</h3>
          <span style={{ fontSize: '0.9rem', color: theme.colors.textMuted }}>92 pts</span>
          <div style={{ marginTop: '0.5rem' }}><span style={getBadgeStyle('Eficiente')}>Eficiente</span></div>
        </div>

        {/* Posición 3 */}
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <Trophy size={28} color="#d97706" style={{ margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Pedro</h3>
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>82 pts</span>
          <div style={{ marginTop: '0.5rem' }}><span style={getBadgeStyle('Moderado')}>Moderado</span></div>
        </div>
      </div>

      {/* Lista del resto de posiciones */}
      <div style={ui.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}>
              <th style={{ padding: '0.75rem' }}>#</th>
              <th style={{ padding: '0.75rem' }}>Usuario</th>
              <th style={{ padding: '0.75rem' }}>Puntos</th>
              <th style={{ padding: '0.75rem' }}>Categoría</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <td style={tdStyle}>4</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>María</td>
              <td style={tdStyle}>75 pts</td>
              <td style={tdStyle}><span style={getBadgeStyle('Moderado')}>Moderado</span></td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <td style={tdStyle}>5</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>José</td>
              <td style={tdStyle}>61 pts</td>
              <td style={tdStyle}><span style={getBadgeStyle('Ineficiente')}>Ineficiente</span></td>
            </tr>
            <tr>
              <td style={tdStyle}>6</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>Lucía</td>
              <td style={tdStyle}>58 pts</td>
              <td style={tdStyle}><span style={getBadgeStyle('Ineficiente')}>Ineficiente</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={ui.infoBanner}>
        <Info size={18} />
        <span>El puntaje se calcula en base a la eficiencia del consumo en los últimos 6 meses.</span>
      </div>
    </div>
  );
}

const tdStyle = { padding: '0.85rem 0.75rem' };