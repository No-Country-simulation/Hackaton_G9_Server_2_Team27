import { Zap, DollarSign, PiggyBank, ShieldCheck, Plus } from 'lucide-react';
import { ui, theme } from '@/styles/theme';

export default function Home() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={ui.pageTitle}>Resumen general</h2>

      {/* 1. Tarjetas de métricas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1 */}
        <div style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: theme.colors.primary, fontWeight: '600', fontSize: '0.85rem' }}>
            <Zap size={16} />
            <span>Consumo actual</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>420 kWh</div>
          <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Este mes</span>
        </div>

        {/* Card 2 */}
        <div style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontWeight: '600', fontSize: '0.85rem' }}>
            <Zap size={16} />
            <span>Categoría</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem', color: '#dc2626' }}>Ineficiente</div>
          <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Probabilidad 81%</span>
        </div>

        {/* Card 3 */}
        <div style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: '600', fontSize: '0.85rem' }}>
            <DollarSign size={16} />
            <span>Costo estimado</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>R$ 315,00</div>
          <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Tarifa: R$ 0,75/kWh</span>
        </div>

        {/* Card 4 */}
        <div style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: theme.colors.primary, fontWeight: '600', fontSize: '0.85rem' }}>
            <PiggyBank size={16} />
            <span>Ahorro posible</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem', color: theme.colors.primary }}>R$ 45,00</div>
          <a href="#" style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textDecoration: 'none' }}>Ver simulación →</a>
        </div>
      </div>

      {/* 2. Sección Inferior: Gráfico + Recomendaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Gráfica de consumo */}
        <div style={ui.card}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1.5rem', color: theme.colors.textSecondary }}>Consumo (kWh) - Últimos 6 meses</h3>
          <div style={{ height: '200px', width: '100%' }}>
            <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%' }}>
              <path d="M 30,140 Q 110,120 180,70 T 330,60 T 470,100" fill="none" stroke="#22c55e" strokeWidth="3" />
              <circle cx="30" cy="140" r="5" fill="#22c55e" />
              <circle cx="110" cy="120" r="5" fill="#22c55e" />
              <circle cx="180" cy="70" r="5" fill="#22c55e" />
              <circle cx="260" cy="90" r="5" fill="#22c55e" />
              <circle cx="330" cy="60" r="5" fill="#22c55e" />
              <circle cx="470" cy="100" r="5" fill="#22c55e" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted, fontSize: '0.8rem', marginTop: '0.5rem' }}>
              <span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>
        </div>

        {/* Lista de Recomendaciones */}
        <div style={ui.card}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem', color: theme.colors.textSecondary }}>Recomendaciones principales</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              'Reducir el uso de equipos durante horarios pico.',
              'Evaluar aparatos con alto consumo energético.',
              'Distribuir actividades de mayor consumo a lo largo del día.'
            ].map((text, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ backgroundColor: theme.colors.primaryBg, padding: '0.35rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color={theme.colors.primary} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botón Flotante / CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button style={{ ...ui.btnPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
          <Plus size={18} />
          <span>Nuevo análisis</span>
        </button>
      </div>
    </div>
  );
}