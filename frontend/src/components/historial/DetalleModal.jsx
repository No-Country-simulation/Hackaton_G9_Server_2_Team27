import { 
  X, 
  Calendar, 
  Zap, 
  Home, 
  Cpu, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Flame
} from 'lucide-react';
import { getBadgeStyle } from '@/styles/theme';

export default function DetalleModal({ item, onClose }) {
  if (!item) return null;

  // Extracción y normalización de datos
  const analisis = item.analisisEnergetico || {};
  const consumo = item.datosConsumo || {};
  
  const rawCat = analisis.categoria || item.categoria || 'N/A';
  const categoriaText = typeof rawCat === 'string' && rawCat !== 'N/A'
    ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase()
    : rawCat;

  const probabilidad = Math.round((analisis.probabilidad || item.probabilidad || 0) * 100);
  const costoEstimado = Number(analisis.costoEstimadoMensual ?? item.costoEstimadoMensual ?? 0).toFixed(2).replace('.', ',');
  let recomendaciones = item.recomendaciones || [];
  if (recomendaciones.length === 0) {
    recomendaciones = [
      "Intenta reducir el uso de equipos durante los horarios de mayor tarifa.",
      "Revisa qué electrodomésticos consumen más energía en modo de espera."
    ];
  }

  // Verificación de uso en horario pico
  const esHorarioPico = consumo.usoHorarioPico ?? item.usoHorarioPico ?? false;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={iconBadgeStyle}>
              <Sparkles size={18} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Detalle del Análisis #{item.id}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                <Calendar size={13} />
                <span>{item.fechaConsulta ? new Date(item.fechaConsulta).toLocaleString('es-PE') : 'N/A'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Banner Superior: Categoría & Probabilidad */}
        <div style={bannerContainerStyle}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Diagnóstico
            </span>
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{ ...getBadgeStyle(categoriaText), fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                {categoriaText}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
              <span>Confianza</span>
              <span>{probabilidad}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${probabilidad}%`, height: '100%', backgroundColor: '#059669', borderRadius: '999px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Grid de Métricas de Consumo (5 items) */}
        <div style={metricsGridStyle}>
          <div style={metricItemStyle}>
            <div style={metricIconWrapperStyle}>
              <Zap size={16} color="#0284c7" />
            </div>
            <div>
              <span style={metricLabelStyle}>Consumo</span>
              <strong style={metricValueStyle}>{consumo.consumoKwh ?? item.consumoKwh ?? 0} kWh</strong>
            </div>
          </div>

          <div style={metricItemStyle}>
            <div style={metricIconWrapperStyle}>
              <Home size={16} color="#8b5cf6" />
            </div>
            <div>
              <span style={metricLabelStyle}>Inmueble</span>
              <strong style={metricValueStyle}>{consumo.tipoInmueble ?? 'Casa'}</strong>
            </div>
          </div>

          <div style={metricItemStyle}>
            <div style={metricIconWrapperStyle}>
              <Cpu size={16} color="#f59e0b" />
            </div>
            <div>
              <span style={metricLabelStyle}>Equipos</span>
              <strong style={metricValueStyle}>{consumo.cantidadEquipos ?? 0} unid.</strong>
            </div>
          </div>

          <div style={metricItemStyle}>
            <div style={metricIconWrapperStyle}>
              <Clock size={16} color="#ec4899" />
            </div>
            <div>
              <span style={metricLabelStyle}>Horas Pico</span>
              <strong style={metricValueStyle}>{consumo.horasAltoConsumo ?? 0} hrs/día</strong>
            </div>
          </div>

          {/* Nueva Métrica: Uso en horario pico */}
          <div style={{ ...metricItemStyle, gridColumn: 'span 2' }}>
            <div style={metricIconWrapperStyle}>
              <Flame size={16} color={esHorarioPico ? '#dc2626' : '#16a34a'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <span style={metricLabelStyle}>Uso en horario pico</span>
                <strong style={{ ...metricValueStyle, color: esHorarioPico ? '#dc2626' : '#16a34a' }}>
                  {esHorarioPico ? 'Sí, concentra consumo' : 'No registra pico'}
                </strong>
              </div>
              <span style={{ 
                fontSize: '0.725rem', 
                fontWeight: '600',
                padding: '0.2rem 0.5rem', 
                borderRadius: '0.375rem',
                backgroundColor: esHorarioPico ? '#fef2f2' : '#f0fdf4',
                color: esHorarioPico ? '#dc2626' : '#16a34a',
                border: `1px solid ${esHorarioPico ? '#fecaca' : '#bbf7d0'}`
              }}>
                {esHorarioPico ? 'Mayor tarifa' : 'Tarifa estándar'}
              </span>
            </div>
          </div>
        </div>

        {/* Costo Estimado Destacado */}
        <div style={costCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#14532d', display: 'block' }}>Costo Mensual Estimado</strong>
              <span style={{ fontSize: '0.7rem', color: '#166534' }}>Proyección base tarifaria</span>
            </div>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d' }}>
            R$ {costoEstimado}
          </span>
        </div>

        {/* Lista de Recomendaciones */}
        {recomendaciones.length > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              Recomendaciones del Asistente
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {recomendaciones.map((rec, i) => (
                <div key={i} style={recommendationItemStyle}>
                  <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.825rem', color: '#334155', lineHeight: '1.35' }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Estilos
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '1rem',
};

const modalCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1.25rem',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  maxWidth: '540px',
  width: '100%',
  padding: '1.5rem',
  border: '1px solid #f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '0.75rem',
};

const iconBadgeStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '0.6rem',
  backgroundColor: '#ecfdf5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const closeBtnStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  padding: '0.35rem',
  cursor: 'pointer',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease',
};

const bannerContainerStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.85rem',
  padding: '0.85rem 1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.65rem',
};

const metricItemStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: '0.75rem',
  padding: '0.65rem 0.85rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
};

const metricIconWrapperStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '0.5rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const metricLabelStyle = {
  fontSize: '0.7rem',
  color: '#64748b',
  display: 'block',
};

const metricValueStyle = {
  fontSize: '0.875rem',
  color: '#0f172a',
};

const costCardStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '0.85rem',
  padding: '0.75rem 1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const recommendationItemStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: '0.65rem',
  padding: '0.55rem 0.85rem',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.6rem',
};