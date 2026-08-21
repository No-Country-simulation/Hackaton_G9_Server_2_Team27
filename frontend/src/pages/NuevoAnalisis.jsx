import { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Cpu, 
  Home, 
  Info,
  Users,
  RotateCcw, 
  Send, 
  Frown, 
  Smile, 
  Meh, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle,
  Loader2,
  Store,
  Factory
} from 'lucide-react';
import { realizarAnalisisEnergetico } from '@/services/analisisService';
import { notificarTelegram } from '@/services/telegramService';

export default function NuevoAnalisis() {
  const initialState = {
    consumoMensual: '',
    usoHorarioPico: '',
    cantidadEquipos: '',
    tipoInmueble: '',
    horasAltoConsumo: '',
    metrosCuadrados: '',
    cantidadPersonas: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(initialState);
    setResultado(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Mapeo exacto hacia tu DTO Spring Boot (@Valid ConsumoRequest)
    const payload = {
      consumo_kwh: Number(formData.consumoMensual),
      uso_horario_pico: formData.usoHorarioPico === 'true' || formData.usoHorarioPico === true,
      cantidad_equipos: Number(formData.cantidadEquipos),
      tipo_inmueble: formData.tipoInmueble,
      horas_alto_consumo: Number(formData.horasAltoConsumo),
      metros_cuadrados: Number(formData.metrosCuadrados),
      cantidad_personas: Number(formData.cantidadPersonas),
    };

    try {
      const responseDTO = await realizarAnalisisEnergetico(payload);
      setResultado(responseDTO);

      // Notificar por Telegram si el usuario está vinculado
      const isLinked = localStorage.getItem('telegramLinked') === 'true';
      const sessionId = localStorage.getItem('telegramSessionId');
      
      if (isLinked && sessionId) {
        // Enviar notificación en background sin bloquear la UI
        notificarTelegram(sessionId, responseDTO).catch(err => 
          console.error('Error al notificar por Telegram:', err)
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo procesar el análisis. Verifica que el backend Java esté en ejecución.');
    } finally {
      setLoading(false);
    }
  };

  // Helper para personalizar según la categoría devuelta por Spring Boot
  const getCategoriaTheme = (catName = '') => {
    const name = catName.toLowerCase();

    if (name.includes('ineficiente')) {
      return {
        bg: '#fff8f0',
        border: '#fee2e2',
        text: '#dc2626',
        icon: <Frown size={68} color="#dc2626" strokeWidth={1.5} />,
        barColor: '#dc2626'
      };
    }

    if (name.includes('eficiente')) {
      return {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        text: '#16a34a',
        icon: <Smile size={68} color="#16a34a" strokeWidth={1.5} />,
        barColor: '#16a34a'
      };
    }

    // Moderado
    return {
      bg: '#fffae6',
      border: '#fef08a',
      text: '#d97706',
      icon: <Meh size={68} color="#d97706" strokeWidth={1.5} />,
      barColor: '#eab308'
    };
  };

  const calcularMetricasExtras = (consumoKwh, tipoInmueble, categoria = '', costoMensual = 0) => {
    // 1. Promedio base según inmueble
    const promedios = { Casa: 300, Departamento: 200, Comercial: 600 };
    const basePromedio = promedios[tipoInmueble] || 250;
    
    const diffPct = Math.round(((consumoKwh - basePromedio) / basePromedio) * 100);
    const esMayor = diffPct > 0;

    // 2. Ahorro estimado según la categoría de ML
    const cat = categoria.toLowerCase();
    let pctAhorro = 0;
    if (cat.includes('ineficiente')) pctAhorro = 0.25;
    else if (cat.includes('moderado')) pctAhorro = 0.10;

    const ahorroMonto = (costoMensual * pctAhorro).toFixed(2);

    return {
      diffTexto: `${esMayor ? '+' : ''}${diffPct}%`,
      diffSubtexto: esMayor ? 'Sobre el promedio' : 'Bajo el promedio',
      diffColor: esMayor ? '#dc2626' : '#16a34a',
      ahorroTexto: pctAhorro > 0 ? `R$ ${ahorroMonto}` : 'R$ 0,00',
      ahorroSubtexto: pctAhorro > 0 ? 'Potencial estimado' : 'Consumo óptimo',
    };
  };

  const catTheme = resultado ? getCategoriaTheme(resultado.categoria?.categoria) : null;
  const probabilidadPct = resultado ? Math.round((resultado.categoria?.probabilidad || 0) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem' }}>
        Nuevo análisis
      </h2>

      {/* Grid Principal de 2 Columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
            Ingresa los datos de tu consumo
          </h3>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Ejemplos rápidos para jurado:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setFormData({ consumoMensual: '250', usoHorarioPico: 'false', cantidadEquipos: '5', tipoInmueble: 'Casa', horasAltoConsumo: '3', metrosCuadrados: '80', cantidadPersonas: '2' })} style={presetBtnStyle}><span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Home size={14} /> Casa Eficiente</span></button>
              <button type="button" onClick={() => setFormData({ consumoMensual: '800', usoHorarioPico: 'true', cantidadEquipos: '15', tipoInmueble: 'Comercial', horasAltoConsumo: '10', metrosCuadrados: '150', cantidadPersonas: '8' })} style={presetBtnStyle}><span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Store size={14} /> Local Moderado</span></button>
              <button type="button" onClick={() => setFormData({ consumoMensual: '2500', usoHorarioPico: 'true', cantidadEquipos: '40', tipoInmueble: 'Comercial', horasAltoConsumo: '16', metrosCuadrados: '400', cantidadPersonas: '25' })} style={presetBtnStyle}><span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Factory size={14} /> Industria Inef.</span></button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Fila 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Consumo mensual (kWh) *</label>
                <div style={inputContainerStyle}>
                  <Zap size={16} color="#64748b" />
                  <input
                    type="number"
                    name="consumoMensual"
                    placeholder="420"
                    value={formData.consumoMensual}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>kWh</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Uso en horario pico *</label>
                <div style={inputContainerStyle}>
                  <Clock size={16} color="#64748b" />
                  <select
                    name="usoHorarioPico"
                    value={formData.usoHorarioPico}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" disabled>Selecciona...</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fila 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Cantidad de equipos *</label>
                <div style={inputContainerStyle}>
                  <Cpu size={16} color="#64748b" />
                  <input
                    type="number"
                    name="cantidadEquipos"
                    placeholder="10"
                    value={formData.cantidadEquipos}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>unid.</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tipo de inmueble *</label>
                <div style={inputContainerStyle}>
                  <Home size={16} color="#64748b" />
                  <select
                    name="tipoInmueble"
                    value={formData.tipoInmueble}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" disabled>Selecciona...</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fila 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Horas de alto consumo por día *</label>
                <div style={inputContainerStyle}>
                  <Clock size={16} color="#64748b" />
                  <input
                    type="number"
                    name="horasAltoConsumo"
                    placeholder="8"
                    value={formData.horasAltoConsumo}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>horas</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Metros cuadrados *</label>
                <div style={inputContainerStyle}>
                  <Home size={16} color="#64748b" />
                  <input
                    type="number"
                    step="0.01"
                    name="metrosCuadrados"
                    placeholder="100.5"
                    value={formData.metrosCuadrados}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>m²</span>
                </div>
              </div>
            </div>

            {/* Fila 4 */}
            <div>
              <label style={labelStyle}>Cantidad de personas *</label>
              <div style={inputContainerStyle}>
                <Users size={16} color="#64748b" />
                <input
                  type="number"
                  name="cantidadPersonas"
                  placeholder="4"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>pers.</span>
              </div>
            </div>

            {/* Banner Informativo */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#166534' }}>
              <Info size={16} color="#166534" />
              <span>Los campos con * son obligatorios.</span>
            </div>

            {/* Botones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={handleClear} 
                style={{ ...btnStyle, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
                disabled={loading}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button 
                type="submit" 
                style={{ ...btnStyle, backgroundColor: '#059669', color: '#ffffff', fontWeight: 'bold' }}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analizando patrones con IA...</>
                ) : (
                  <><Send size={16} /> Analizar consumo</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: Resultados del Análisis */}
        <div>
          {resultado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} /> Resultados del análisis
              </h3>

              {/* Card 1: Categoría y Barra de Probabilidad */}
              <div
                style={{
                  backgroundColor: catTheme.bg,
                  border: `1px solid ${catTheme.border}`,
                  borderRadius: '1.25rem',
                  padding: '1.25rem 1.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1.3fr',
                  gap: '1.5rem',
                  alignItems: 'center',
                }}
              >
                {/* Sección Izquierda: Texto + Ícono */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '500' }}>
                      Categoría
                    </span>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: catTheme.text, margin: 0, lineHeight: 1.1 }}>
                      {resultado.categoria?.categoria}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {catTheme.icon}
                  </div>
                </div>

                {/* Divisor Vertical */}
                <div style={{ width: '1px', height: '80%', backgroundColor: '#e2e8f0' }} />

                {/* Sección Derecha: Probabilidad */}
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '500' }}>
                    {resultado.categoria?.categoria?.toLowerCase().includes('ineficiente')
                      ? 'Probabilidad de ineficiencia'
                      : `Probabilidad de ${resultado.categoria?.categoria?.toLowerCase()}`}
                  </span>
                  
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: catTheme.text, margin: '0.2rem 0 0.5rem 0' }}>
                    {probabilidadPct}%
                  </h3>

                  <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${probabilidadPct}%`,
                        height: '100%',
                        backgroundColor: catTheme.barColor,
                        backgroundImage: `linear-gradient(
                          45deg,
                          rgba(255, 255, 255, 0.25) 25%,
                          transparent 25%,
                          transparent 50%,
                          rgba(255, 255, 255, 0.25) 50%,
                          rgba(255, 255, 255, 0.25) 75%,
                          transparent 75%,
                          transparent
                        )`,
                        backgroundSize: '1rem 1rem',
                        borderRadius: '9999px',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Resumen del Consumo Calculado Dinámicamente */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '1rem' }}>Resumen del consumo</h4>
                
                {(() => {
                  const extras = calcularMetricasExtras(
                    Number(formData.consumoMensual),
                    formData.tipoInmueble,
                    resultado.categoria?.categoria,
                    resultado.estimacionFinanciera?.costoEstimadoMensual
                  );

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                      
                      {/* 1. Consumo */}
                      <div style={metricCardStyle}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Consumo estimado</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.25rem 0' }}>
                          {formData.consumoMensual} kWh
                        </strong>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Mensual</span>
                      </div>

                      {/* 2. Costo */}
                      <div style={metricCardStyle}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Costo estimado</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.25rem 0' }}>
                          R$ {resultado.estimacionFinanciera?.costoEstimadoMensual}
                        </strong>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Tarifa: R$ 0.75/kWh</span>
                      </div>

                      {/* 3. Comparado promedio (Calculado) */}
                      <div style={metricCardStyle}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Comparado promedio</span>
                        <strong style={{ fontSize: '1.1rem', color: extras.diffColor, margin: '0.25rem 0' }}>
                          {extras.diffTexto}
                        </strong>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{extras.diffSubtexto}</span>
                      </div>

                      {/* 4. Ahorro posible (Calculado) */}
                      <div style={metricCardStyle}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ahorro posible</span>
                        <strong style={{ fontSize: '1.1rem', color: '#16a34a', margin: '0.25rem 0' }}>
                          {extras.ahorroTexto}
                        </strong>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{extras.ahorroSubtexto}</span>
                      </div>

                    </div>
                  );
                })()}
              </div>

              {/* Card 3: Recomendaciones Clave */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="#eab308" /> Recomendaciones clave
                </h4>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {(() => {
                    let recs = [];
                    if (Array.isArray(resultado.recomendaciones)) {
                      recs = resultado.recomendaciones;
                    } else if (Array.isArray(resultado.recomendaciones?.recomendaciones)) {
                      recs = resultado.recomendaciones.recomendaciones;
                    }
                    if (!recs || recs.length === 0) {
                      recs = [
                        "Intenta reducir el uso de equipos durante los horarios de mayor tarifa.",
                        "Revisa qué electrodomésticos consumen más energía en modo de espera."
                      ];
                    }

                    return recs.map((rec, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '0.85rem', 
                          fontSize: '0.825rem', 
                          color: '#334155',
                          backgroundColor: '#f8fafc',
                          padding: '0.85rem',
                          borderRadius: '0.75rem',
                          border: '1px solid #f1f5f9'
                        }}
                      >
                        <div style={{ backgroundColor: '#ecfdf5', padding: '0.35rem', borderRadius: '0.4rem', flexShrink: 0, marginTop: '2px' }}>
                          <CheckCircle2 size={16} color="#16a34a" />
                        </div>
                        <span style={{ lineHeight: '1.45' }}>{rec}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Card 4: Estimación Financiera Destacada */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#059669', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Estimación financiera</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Costo estimado mensual</span>
                  </div>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                  R$ {resultado.estimacionFinanciera?.costoEstimadoMensual}
                </h2>
              </div>

            </div>
          ) : (
            /* Placeholder */
            <div style={{ backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Zap size={48} color="#94a3b8" />
              <div>
                <h4 style={{ fontWeight: 'bold', color: '#334155', marginBottom: '0.25rem' }}>Esperando análisis</h4>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Rellena el formulario de la izquierda y haz clic en "Analizar consumo" para generar el informe.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Estilos Auxiliares
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '0.35rem',
};

const inputContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
};

const inputStyle = {
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  outline: 'none',
  fontSize: '0.875rem',
  color: '#0f172a',
};

const btnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: 'none',
};

const metricCardStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: '0.5rem',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
};

const presetBtnStyle = {
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1',
  padding: '0.4rem 0.75rem',
  borderRadius: '2rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};
// Add global spinner keyframes safely
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}