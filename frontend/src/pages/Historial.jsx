import { useState, useMemo } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ui, getBadgeStyle, theme } from '@/styles/theme';
import { obtenerAnalisisPorId } from '@/services/analisisService';

// Datos de prueba simulando registros en Base de Datos
const MOCK_HISTORIAL = [
  { id: 1, fecha: '12/07/2026', consumo: '420 kWh', categoria: 'Ineficiente', costo: 'R$ 315,00' },
  { id: 2, fecha: '05/07/2026', consumo: '370 kWh', categoria: 'Moderado', costo: 'R$ 277,50' },
  { id: 3, fecha: '29/06/2026', consumo: '250 kWh', categoria: 'Eficiente', costo: 'R$ 187,50' },
  { id: 4, fecha: '22/06/2026', consumo: '480 kWh', categoria: 'Ineficiente', costo: 'R$ 360,00' },
  { id: 5, fecha: '15/06/2026', consumo: '410 kWh', categoria: 'Moderado', costo: 'R$ 307,50' },
  { id: 6, fecha: '08/06/2026', consumo: '290 kWh', categoria: 'Eficiente', costo: 'R$ 217,50' },
  { id: 7, fecha: '01/06/2026', consumo: '510 kWh', categoria: 'Ineficiente', costo: 'R$ 382,50' },
  { id: 8, fecha: '25/05/2026', consumo: '360 kWh', categoria: 'Moderado', costo: 'R$ 270,00' },
  { id: 9, fecha: '18/05/2026', consumo: '230 kWh', categoria: 'Eficiente', costo: 'R$ 172,50' },
  { id: 10, fecha: '11/05/2026', consumo: '440 kWh', categoria: 'Ineficiente', costo: 'R$ 330,00' },
  { id: 11, fecha: '04/05/2026', consumo: '380 kWh', categoria: 'Moderado', costo: 'R$ 285,00' },
  { id: 12, fecha: '27/04/2026', consumo: '210 kWh', categoria: 'Eficiente', costo: 'R$ 157,50' },
];

export default function Historial() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Elementos a mostrar por página
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Filtrado por búsqueda
  const filteredData = useMemo(() => {
    return MOCK_HISTORIAL.filter((item) =>
      item.fecha.includes(searchTerm) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.consumo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // 2. Cálculos de Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejar cambio en la búsqueda (Reinicia a la página 1)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Consulta de detalle por ID al Backend Java (GET /analisis-energetico/{id})
  const handleInspect = async (id) => {
    try {
      const dataDTO = await obtenerAnalisisPorId(id);
      setSelectedItem(dataDTO);
    } catch (error) {
      console.warn('Cargando respaldo local para ID:', id);
      const localMatch = MOCK_HISTORIAL.find((item) => item.id === id);
      setSelectedItem(localMatch || null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header con búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={ui.pageTitle}>Historial de análisis</h2>
        
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Buscar por fecha o categoría..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ ...ui.input, paddingRight: '2.5rem' }}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Tabla principal */}
      <div style={ui.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Consumo</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Costo estimado</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  <td style={tdStyle}>{row.fecha}</td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{row.consumo}</td>
                  <td style={tdStyle}>
                    <span style={getBadgeStyle(row.categoria)}>{row.categoria}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{row.costo}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => handleInspect(row.id)} style={actionBtnStyle} title="Ver detalles">
                      <Eye size={16} color="#64748b" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textMuted }}>
                  No se encontraron registros que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Barra de Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Información del rango visible */}
          <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
            Mostrando {filteredData.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
          </span>

          {/* Botones de navegación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Botón Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...pageBtnStyle,
                opacity: currentPage === 1 ? 0.4 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Números de páginas */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    ...pageBtnStyle,
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.white,
                    color: isActive ? theme.colors.white : theme.colors.textMain,
                    fontWeight: isActive ? '600' : '400',
                    border: isActive ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`
                  }}
                >
                  {page}
                </button>
              );
            })}

            {/* Botón Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...pageBtnStyle,
                opacity: currentPage === totalPages ? 0.4 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Inspeccionar detalle */}
      {selectedItem && (
        <div style={modalOverlayStyle}>
          <div style={{ ...ui.card, maxWidth: '480px', width: '100%', position: 'relative', padding: '1.75rem' }}>
            <button onClick={() => setSelectedItem(null)} style={closeBtnStyle}><X size={18} /></button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: theme.colors.textMain }}>
              Detalle del Análisis #{selectedItem.id}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div><strong>Fecha:</strong> {selectedItem.fecha}</div>
              <div><strong>Consumo Registrado:</strong> {selectedItem.consumoMensual ? `${selectedItem.consumoMensual} kWh` : selectedItem.consumo}</div>
              <div><strong>Categoría:</strong> <span style={getBadgeStyle(selectedItem.categoria)}>{selectedItem.categoria}</span></div>
              <div><strong>Costo Estimado:</strong> {selectedItem.costoEstimado ? `R$ ${selectedItem.costoEstimado}` : selectedItem.costo}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '0.85rem 1rem', fontWeight: '600' };
const tdStyle = { padding: '1rem', color: theme.colors.textSecondary };
const actionBtnStyle = { background: '#f8fafc', border: `1px solid ${theme.colors.border}`, padding: '0.4rem 0.6rem', borderRadius: '0.375rem', cursor: 'pointer' };
const pageBtnStyle = { border: `1px solid ${theme.colors.border}`, backgroundColor: '#fff', padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', minWidth: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' };
const closeBtnStyle = { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };