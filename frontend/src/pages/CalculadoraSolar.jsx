import { useState } from 'react';
import { Info, Sun } from 'lucide-react';
import { ui, theme } from '@/styles/theme';
import { calcularPanelesSolares } from '@/services/analisisService';

export default function CalculadoraSolar() {
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
      <h2 style={ui.pageTitle}>Calculadora de Paneles Solares</h2>

      <div style={ui.card}>
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
      </div>
    </div>
  );
}
