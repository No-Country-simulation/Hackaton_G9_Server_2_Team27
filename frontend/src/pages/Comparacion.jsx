import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Scale, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { ui, theme, getBadgeStyle } from '@/styles/theme';
import { obtenerHistorialAnalisis } from '@/services/analisisService';

export default function Comparacion() {
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorialAnalisis();
      if (data && data.length > 0) {
        // Ordenar del más nuevo al más viejo
        const ordenados = [...data].sort((a, b) => new Date(b.fechaConsulta) - new Date(a.fechaConsulta));
        setHistorial(ordenados);

        // Preseleccionar los dos más recientes
        setIdA(ordenados[0]?.id?.toString() || '');
        setIdB(ordenados[1]?.id?.toString() || ordenados[0]?.id?.toString() || '');
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener los objetos seleccionados
  const analisisA = historial.find((h) => h.id?.toString() === idA.toString()) || null;
  const analisisB = historial.find((h) => h.id?.toString() === idB.toString()) || null;

  // Extracción de datos normalizados
  const kwhA = analisisA?.datosConsumo?.consumoKwh ?? 0;
  const kwhB = analisisB?.datosConsumo?.consumoKwh ?? 0;
  const costoA = analisisA?.analisisEnergetico?.costoEstimadoMensual ?? 0;
  const costoB = analisisB?.analisisEnergetico?.costoEstimadoMensual ?? 0;
  const horasA = analisisA?.datosConsumo?.horasAltoConsumo ?? 0;
  const horasB = analisisB?.datosConsumo?.horasAltoConsumo ?? 0;
  const equiposA = analisisA?.datosConsumo?.cantidadEquipos ?? 0;
  const equiposB = analisisB?.datosConsumo?.cantidadEquipos ?? 0;

  // Categorías
  const catA = analisisA?.analisisEnergetico?.categoria || 'N/A';
  const catB = analisisB?.analisisEnergetico?.categoria || 'N/A';

  // Cálculos de variación (A respecto a B)
  const diffKwh = kwhB > 0 ? Math.round(((kwhA - kwhB) / kwhB) * 100) : 0;
  const diffCosto = costoA - costoB;
  const esMenorConsumo = kwhA < kwhB;

  // Datos para la gráfica comparativa con Recharts
  const dataGrafico = [
    { metrica: 'Consumo (kWh)', 'Análisis A': kwhA, 'Análisis B': kwhB },
    { metrica: 'Costo (R$)', 'Análisis A': costoA, 'Análisis B': costoB },
    { metrica: 'Horas Pico (hrs)', 'Análisis A': horasA, 'Análisis B': horasB },
    { metrica: 'Equipos (und)', 'Análisis A': equiposA, 'Análisis B': equiposB }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', gap: '0.5rem', color: theme.colors.textMuted }}>
        <Loader2 size={24} className="animate-spin" color="#059669" />
        <span>Cargando datos para comparación...</span>
      </div>
    );
  }

  if (historial.length < 2) {
    return (
      <div style={{ ...ui.card, padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>Se necesitan al menos 2 análisis</h3>
        <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
          Realiza un par de evaluaciones en la pestaña "Nuevo análisis" para poder contrastar el consumo entre diferentes fechas.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Encabezado */}
      <div>
        <h2 style={ui.pageTitle}>Comparación de análisis</h2>
        <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, margin: '0.25rem 0 0' }}>
          Contrasta dos evaluaciones registradas para verificar el impacto de tus hábitos de consumo.
        </p>
      </div>

      {/* Selectores de Período A y B */}
      <div style={{ ...ui.card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
            Análisis A (Referencia Actual)
          </label>
          <select 
            value={idA} 
            onChange={(e) => setIdA(e.target.value)} 
            style={{ ...ui.input, marginTop: '0.4rem', cursor: 'pointer', fontWeight: '500' }}
          >
            {historial.map((item) => (
              <option key={`a-${item.id}`} value={item.id}>
                #{item.id} - {item.fechaConsulta ? new Date(item.fechaConsulta).toLocaleDateString('es-PE') : 'Sin fecha'} ({item.datosConsumo?.consumoKwh ?? 0} kWh - {item.datosConsumo?.tipoInmueble ?? 'Casa'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
            Análisis B (Para Comparar)
          </label>
          <select 
            value={idB} 
            onChange={(e) => setIdB(e.target.value)} 
            style={{ ...ui.input, marginTop: '0.4rem', cursor: 'pointer', fontWeight: '500' }}
          >
            {historial.map((item) => (
              <option key={`b-${item.id}`} value={item.id}>
                #{item.id} - {item.fechaConsulta ? new Date(item.fechaConsulta).toLocaleDateString('es-PE') : 'Sin fecha'} ({item.datosConsumo?.consumoKwh ?? 0} kWh - {item.datosConsumo?.tipoInmueble ?? 'Casa'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de 4 Métricas Comparativas Directas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Métrica 1: Variación de Consumo */}
        <div style={ui.card}>
          <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: '600' }}>Variación de Consumo</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.4rem 0 0.2rem', color: '#0f172a' }}>
            {kwhA} vs {kwhB} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: esMenorConsumo ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {esMenorConsumo ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            <span>{Math.abs(diffKwh)}% {esMenorConsumo ? 'menos consumo' : 'más consumo'}</span>
          </div>
        </div>

        {/* Métrica 2: Diferencia en Factura */}
        <div style={ui.card}>
          <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: '600' }}>Diferencia Estimada</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.4rem 0 0.2rem', color: diffCosto <= 0 ? '#16a34a' : '#dc2626' }}>
            {diffCosto <= 0 ? `- R$ ${Math.abs(diffCosto).toFixed(2)}` : `+ R$ ${diffCosto.toFixed(2)}`}
          </div>
          <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
            {diffCosto <= 0 ? 'Ahorro económico logrado' : 'Incremento en el costo'}
          </span>
        </div>

        {/* Métrica 3: Evolución de Categoría */}
        <div style={ui.card}>
          <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: '600' }}>Diagnóstico IA (A vs B)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ ...getBadgeStyle(catA), fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>{catA}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>vs</span>
            <span style={{ ...getBadgeStyle(catB), fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>{catB}</span>
          </div>
        </div>

        {/* Métrica 4: Horas en Pico */}
        <div style={ui.card}>
          <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: '600' }}>Horas de Alto Consumo</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.4rem 0 0.2rem', color: '#0f172a' }}>
            {horasA}h <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>vs</span> {horasB}h
          </div>
          <span style={{ fontSize: '0.75rem', color: horasA <= horasB ? '#16a34a' : '#dc2626' }}>
            {horasA <= horasB ? 'Reducción de horas pico' : 'Mayor exposición a tarifa pico'}
          </span>
        </div>

      </div>

      {/* Gráfico Comparativo con Recharts */}
      <div style={{ ...ui.card, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Comparativa de Parámetros Clave
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Contraste métrica por métrica entre ambos análisis</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: '600' }}>
            <span style={{ color: '#059669' }}>■ Análisis A (#{idA})</span>
            <span style={{ color: '#94a3b8' }}>■ Análisis B (#{idB})</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="metrica" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.06)', fontSize: '0.8rem' }}
              />
              <Legend />
              <Bar dataKey="Análisis A" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="Análisis B" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}