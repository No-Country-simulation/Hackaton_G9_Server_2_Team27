import { useState } from 'react';
import { Info } from 'lucide-react';
import { ui, theme } from '@/styles/theme';
import { calcularPanelesSolares } from '@/services/analisisService';

export default function Simulador() {
  const [escenario, setEscenario] = useState('reducir');
  const [horasReduccion, setHorasReduccion] = useState(2);
  
  // Estado para paneles
  const [consumoKwh, setConsumoKwh] = useState(420);
  const [horasSolPico, setHorasSolPico] = useState(5);
  const [resultadoPaneles, setResultadoPaneles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalcularPaneles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await calcularPanelesSolares({
        consumoKwh: parseFloat(consumoKwh),
        horasSolPico: parseFloat(horasSolPico)
      });
      setResultadoPaneles(result);
    } catch (err) {
      setError('Error al calcular los paneles solares. Verifique los datos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={ui.pageTitle}>5. Simulación de escenarios de ahorro</h2>

      <div style={ui.card}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Escenario</label>
          <select 
            style={{ ...ui.input, marginTop: '0.35rem' }} 
            value={escenario}
            onChange={(e) => setEscenario(e.target.value)}
          >
            <option value="reducir">Reducir horas de uso diario en horarios pico</option>
            <option value="paneles">Instalar paneles solares</option>
          </select>
        </div>

        {escenario === 'reducir' && (
          <>
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
          </>
        )}

        {escenario === 'paneles' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Consumo Mensual (kWh)</label>
                <input 
                  type="number" 
                  style={{ ...ui.input, marginTop: '0.35rem' }} 
                  value={consumoKwh}
                  onChange={(e) => setConsumoKwh(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Horas de Sol Pico</label>
                <input 
                  type="number" 
                  style={{ ...ui.input, marginTop: '0.35rem' }} 
                  value={horasSolPico}
                  onChange={(e) => setHorasSolPico(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={handleCalcularPaneles} 
              style={{ ...ui.button, width: '100%', marginBottom: '1.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Calculando...' : 'Calcular Paneles Solares'}
            </button>

            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            {resultadoPaneles && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Paneles necesarios</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{resultadoPaneles.panelesNecesarios}</div>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>paneles (400W)</span>
                </div>
                <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Generación mensual</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{resultadoPaneles.generacionMensualKwh}</div>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>kWh</span>
                </div>
                <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Cobertura</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{resultadoPaneles.coberturaPorcentaje}%</div>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>del consumo</span>
                </div>
                <div style={{ ...ui.card, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Ahorro estimado</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.primary, margin: '0.25rem 0' }}>R$ {resultadoPaneles.ahorroEstimadoMensual.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div style={ui.infoBanner}>
              <Info size={18} />
              <span>Cálculo basado en paneles de 400W, 80% de eficiencia y tarifa de R$ 0,75/kWh.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}