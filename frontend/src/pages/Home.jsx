import { useState, useEffect } from 'react';
import { 
  Zap, 
  DollarSign, 
  PiggyBank, 
  ShieldCheck, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Loader2,
  AlertCircle,
  Clock,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { ui, theme, getBadgeStyle } from '@/styles/theme';
import { obtenerHistorialAnalisis } from '@/services/analisisService';

export default function Home({ onNavigateToNew }) {
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [ultimoAnalisis, setUltimoAnalisis] = useState(null);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorialAnalisis();
      
      if (data && data.length > 0) {
        // Ordenar cronológicamente para la gráfica (antiguo -> nuevo)
        const ordenados = [...data].sort((a, b) => new Date(a.fechaConsulta) - new Date(b.fechaConsulta));
        setHistorial(ordenados);
        
        // El último elemento es el más reciente
        setUltimoAnalisis(ordenados[ordenados.length - 1]);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar navegación segura hacia el nuevo análisis
  const handleIrANuevoAnalisis = () => {
    if (typeof onNavigateToNew === 'function') {
      onNavigateToNew();
    } else {
      // Fallback si usas hash routing o rutas manuales
      window.location.hash = '#/nuevo-analisis';
    }
  };

  // Preparar datos para Recharts
  const chartData = historial.slice(-10).map((item, idx) => {
    const fecha = item.fechaConsulta ? new Date(item.fechaConsulta) : new Date();
    const labelFecha = fecha.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
    const kwh = item.datosConsumo?.consumoKwh ?? item.consumoKwh ?? 0;
    const costo = item.analisisEnergetico?.costoEstimadoMensual ?? item.costoEstimadoMensual ?? 0;

    return {
      name: labelFecha || `Análisis #${idx + 1}`,
      kwh: kwh,
      costo: costo
    };
  });

  // Cálculo del promedio histórico
  const promedioHistoricoKwh = historial.length > 0
    ? Math.round(historial.reduce((acc, curr) => acc + (curr.datosConsumo?.consumoKwh || 0), 0) / historial.length)
    : 300;

  // Datos del último análisis
  const consumoKwh = ultimoAnalisis?.datosConsumo?.consumoKwh ?? 0;
  const rawCat = ultimoAnalisis?.analisisEnergetico?.categoria ?? 'N/A';
  const categoria = typeof rawCat === 'string' && rawCat !== 'N/A'
    ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase()
    : rawCat;
  
  const probabilidad = Math.round((ultimoAnalisis?.analisisEnergetico?.probabilidad ?? 0) * 100);
  const costoEstimado = Number(ultimoAnalisis?.analisisEnergetico?.costoEstimadoMensual ?? 0).toFixed(2).replace('.', ',');
  
  // Cálculo de Ahorro estimado
  const pctAhorro = categoria.toLowerCase().includes('ineficiente') ? 0.25 : categoria.toLowerCase().includes('moderado') ? 0.10 : 0;
  const ahorroEstimado = ((ultimoAnalisis?.analisisEnergetico?.costoEstimadoMensual ?? 0) * pctAhorro).toFixed(2).replace('.', ',');

  // Comparación contra el promedio del historial
  const diffPromedio = promedioHistoricoKwh > 0 ? Math.round(((consumoKwh - promedioHistoricoKwh) / promedioHistoricoKwh) * 100) : 0;
  const esMayorPromedio = diffPromedio > 0;

  const recomendaciones = ultimoAnalisis?.recomendaciones?.length > 0 
    ? ultimoAnalisis.recomendaciones 
    : [
        'Desconecta dispositivos de alto consumo en horarios punta.',
        'Regula la temperatura de refrigeración y climatización.',
        'Aprovecha la iluminación natural matutina para reducir cargas.'
      ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '0.75rem', color: '#64748b' }}>
        <Loader2 size={28} className="animate-spin" color="#059669" />
        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Cargando panel de control...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. Header con CTA Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Resumen general
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
            Diagnóstico energético predictivo y monitoreo en tiempo real
          </p>
        </div>

        <button 
          onClick={handleIrANuevoAnalisis}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#059669',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.875rem',
            padding: '0.7rem 1.4rem',
            borderRadius: '0.6rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        >
          <Plus size={18} />
          <span>Nuevo análisis</span>
        </button>
      </div>

      {/* 2. Grid de Métricas Principales (4 Tarjetas Optimizadas) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Consumo Actual */}
        <div style={cardWrapperStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardLabelStyle}>Consumo Registrado</span>
            <div style={{ backgroundColor: '#ecfdf5', padding: '0.4rem', borderRadius: '0.5rem' }}>
              <Zap size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 0.35rem' }}>
            {consumoKwh} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>kWh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: esMayorPromedio ? '#dc2626' : '#16a34a', fontWeight: '600' }}>
            {esMayorPromedio ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(diffPromedio)}% vs. promedio ({promedioHistoricoKwh} kWh)</span>
          </div>
        </div>

        {/* Card 2: Diagnóstico IA */}
        <div style={cardWrapperStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardLabelStyle}>Diagnóstico del Modelo</span>
            <div style={{ backgroundColor: '#fff7ed', padding: '0.4rem', borderRadius: '0.5rem' }}>
              <Sparkles size={16} color="#ea580c" />
            </div>
          </div>
          <div style={{ margin: '0.6rem 0 0.5rem' }}>
            <span style={{ ...getBadgeStyle(categoria), fontSize: '1rem', padding: '0.25rem 0.75rem', fontWeight: '700' }}>
              {categoria}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Nivel de confianza</span>
            <strong style={{ color: '#0f172a' }}>{probabilidad}%</strong>
          </div>
        </div>

        {/* Card 3: Costo Proyectado */}
        <div style={cardWrapperStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardLabelStyle}>Costo Estimado</span>
            <div style={{ backgroundColor: '#eff6ff', padding: '0.4rem', borderRadius: '0.5rem' }}>
              <DollarSign size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 0.35rem' }}>
            R$ {costoEstimado}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tarifa base: R$ 0,75 / kWh</span>
        </div>

        {/* Card 4: Ahorro Potencial */}
        <div style={{ ...cardWrapperStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...cardLabelStyle, color: '#166534' }}>Ahorro Potencial</span>
            <div style={{ backgroundColor: '#dcfce7', padding: '0.4rem', borderRadius: '0.5rem' }}>
              <PiggyBank size={16} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#15803d', margin: '0.5rem 0 0.35rem' }}>
            R$ {ahorroEstimado}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
            {pctAhorro > 0 ? `Reducción estimada del ${pctAhorro * 100}%` : 'Perfil optimizado'}
          </span>
        </div>

      </div>

      {/* 3. Sección Central: Gráfica de Tendencia + Recomendaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Gráfico Recharts con Línea de Referencia */}
        <div style={{ ...cardWrapperStyle, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Evolución del Consumo
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tendencia de consumo registrado en kWh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontWeight: '600' }}>
              <Calendar size={13} /> Historial
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} interval="preserveStartEnd" minTickGap={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontSize: '0.8rem' }}
                    formatter={(value) => [`${value} kWh`, 'Consumo']}
                  />
                  {/* Línea de Promedio de Referencia */}
                  <ReferenceLine 
                    y={promedioHistoricoKwh} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: `Prom: ${promedioHistoricoKwh} kWh`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="kwh" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#areaGradient)" 
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <AlertCircle size={32} />
                <span style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No hay registros disponibles</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral: Recomendaciones Clave */}
        <div style={{ ...cardWrapperStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Recomendaciones del Modelo
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Acciones para optimizar la factura eléctrica</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recomendaciones.map((text, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem', 
                  padding: '0.8rem 1rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ backgroundColor: '#ecfdf5', padding: '0.35rem', borderRadius: '0.4rem', flexShrink: 0, marginTop: '2px' }}>
                  <ShieldCheck size={16} color="#059669" />
                </div>
                <span style={{ fontSize: '0.825rem', color: '#334155', lineHeight: '1.45' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Mini resumen de contexto */}
          {ultimoAnalisis?.datosConsumo && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #dcfce7', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#166534' }}>
                <Cpu size={15} />
                <span>{ultimoAnalisis.datosConsumo.cantidadEquipos || 0} equipos activos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#166534' }}>
                <Clock size={15} />
                <span>{ultimoAnalisis.datosConsumo.horasAltoConsumo || 0} hrs/día de pico</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Estilos Reutilizables
const cardWrapperStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1.25rem 1.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
};

const cardLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#64748b',
};