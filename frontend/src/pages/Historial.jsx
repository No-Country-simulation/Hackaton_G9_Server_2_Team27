import { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Home, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { ui, getBadgeStyle, theme } from '@/styles/theme';
import { obtenerAnalisisPorId, obtenerHistorialAnalisis } from '@/services/analisisService';
import DetalleModal from '@/components/historial/DetalleModal';

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroInmueble, setFiltroInmueble] = useState('TODOS');
  
  // Paginación y selección
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorialAnalisis();
      
      // Ordenar cronológicamente descendente (más nuevo al más antiguo)
      const ordenadosDesc = [...data].sort((a, b) => {
        const fechaA = new Date(a.fechaConsulta).getTime();
        const fechaB = new Date(b.fechaConsulta).getTime();
        return fechaB - fechaA;
      });

      const adaptados = ordenadosDesc.map((item) => {
        const analisis = item.analisisEnergetico || {};
        const consumo = item.datosConsumo || {};

        const rawCat = analisis.categoria || item.categoria || 'N/A';
        const categoriaFormatted = typeof rawCat === 'string' && rawCat !== 'N/A'
          ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase()
          : rawCat;

        const costoNum = Number(analisis.costoEstimadoMensual ?? item.costoEstimadoMensual ?? 0);

        return {
          id: item.id,
          fecha: item.fechaConsulta ? new Date(item.fechaConsulta).toLocaleDateString('es-PE') : 'N/A',
          consumo: `${consumo.consumoKwh ?? item.consumoKwh ?? 0} kWh`,
          consumoNum: consumo.consumoKwh ?? item.consumoKwh ?? 0,
          inmueble: consumo.tipoInmueble || 'No especificado',
          categoria: categoriaFormatted,
          costo: `R$ ${costoNum.toFixed(2).replace('.', ',')}`,
          raw: item
        };
      });

      setHistorial(adaptados);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado reactivo multidimensional
  const filteredData = useMemo(() => {
    return historial.filter((item) => {
      const matchCategoria = 
        filtroCategoria === 'TODAS' || 
        item.categoria.toLowerCase() === filtroCategoria.toLowerCase();

      const matchInmueble = 
        filtroInmueble === 'TODOS' || 
        item.inmueble.toLowerCase() === filtroInmueble.toLowerCase();

      return matchCategoria && matchInmueble;
    });
  }, [historial, filtroCategoria, filtroInmueble]);

  // Manejadores de cambios de filtro con reseteo de página a la primera
  const handleCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
    setCurrentPage(1);
  };

  const handleInmuebleChange = (e) => {
    setFiltroInmueble(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFiltros = () => {
    setFiltroCategoria('TODAS');
    setFiltroInmueble('TODOS');
    setCurrentPage(1);
  };

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleInspect = async (id) => {
    try {
      const dataDTO = await obtenerAnalisisPorId(id);
      setSelectedItem(dataDTO);
    } catch (error) {
      console.error('Error al consultar detalle:', error);
      const fallback = historial.find((h) => h.id === id);
      setSelectedItem(fallback?.raw || null);
    }
  };

  const hayFiltrosActivos = filtroCategoria !== 'TODAS' || filtroInmueble !== 'TODOS';

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Encabezado y Barra de Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={ui.pageTitle}>Historial de análisis</h2>
          <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, margin: '0.25rem 0 0' }}>
            Consulta y filtra todos los diagnósticos energéticos registrados
          </p>
        </div>

        {/* Grupo de Controles de Filtro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Filtro por Categoría */}
          <div style={filterWrapperStyle}>
            <Tag size={15} color="#64748b" />
            <select 
              value={filtroCategoria} 
              onChange={handleCategoriaChange} 
              style={selectFilterStyle}
            >
              <option value="TODAS">Categoría: Todas</option>
              <option value="Eficiente">Eficiente</option>
              <option value="Moderado">Moderado</option>
              <option value="Ineficiente">Ineficiente</option>
            </select>
          </div>

          {/* Filtro por Inmueble */}
          <div style={filterWrapperStyle}>
            <Home size={15} color="#64748b" />
            <select 
              value={filtroInmueble} 
              onChange={handleInmuebleChange} 
              style={selectFilterStyle}
            >
              <option value="TODOS">Inmueble: Todos</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Comercial">Comercial</option>
            </select>
          </div>

          {/* Botón Reset */}
          {hayFiltrosActivos && (
            <button 
              onClick={handleResetFiltros} 
              style={resetBtnStyle}
              title="Limpiar filtros"
            >
              <RotateCcw size={14} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla Principal */}
      <div style={ui.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Inmueble</th>
              <th style={thStyle}>Consumo</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Costo estimado</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textMuted }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={20} className="animate-spin" color="#059669" /> Cargando historial...
                  </div>
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${theme.colors.border}`, transition: 'background-color 0.15s ease' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
                      <Calendar size={14} color="#94a3b8" />
                      <span>{row.fecha}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.825rem', color: '#64748b' }}>{row.inmueble}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{row.consumo}</td>
                  <td style={tdStyle}>
                    <span style={getBadgeStyle(row.categoria)}>{row.categoria}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{row.costo}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => handleInspect(row.id)} style={actionBtnStyle} title="Ver detalles completos">
                      <Eye size={16} color="#059669" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textMuted }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={24} color="#94a3b8" />
                    <span>No se encontraron registros que coincidan con los filtros seleccionados.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginador */}
        {!loading && filteredData.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.825rem', color: theme.colors.textMuted }}>
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...pageBtnStyle,
                  opacity: currentPage === 1 ? 0.35 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      ...pageBtnStyle,
                      backgroundColor: isActive ? '#059669' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: isActive ? '700' : '500',
                      borderColor: isActive ? '#059669' : '#cbd5e1'
                    }}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...pageBtnStyle,
                  opacity: currentPage === totalPages ? 0.35 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <DetalleModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}

// Estilos del Componente
const thStyle = { 
  padding: '0.85rem 1rem', 
  fontWeight: '600',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = { 
  padding: '1rem', 
  fontSize: '0.875rem'
};

const filterWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  padding: '0.4rem 0.65rem',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
};

const selectFilterStyle = {
  border: 'none',
  outline: 'none',
  fontSize: '0.825rem',
  color: '#334155',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontWeight: '500'
};

const resetBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  padding: '0.45rem 0.75rem',
  fontSize: '0.8rem',
  color: '#64748b',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const actionBtnStyle = { 
  background: '#ecfdf5', 
  border: '1px solid #bbf7d0', 
  padding: '0.4rem 0.6rem', 
  borderRadius: '0.45rem', 
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease'
};

const pageBtnStyle = { 
  border: '1px solid #cbd5e1', 
  backgroundColor: '#fff', 
  padding: '0.4rem 0.75rem', 
  borderRadius: '0.375rem', 
  fontSize: '0.825rem', 
  minWidth: '32px', 
  display: 'inline-flex', 
  alignItems: 'center', 
  justifyContent: 'center' 
};