const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Envía los datos de consumo al backend para procesar el análisis energético.
 * @param {Object} consumoRequest Datos del formulario
 * @returns {Promise<Object>} Promesa con el AnalisisResponse del backend
 */
export const realizarAnalisisEnergetico = async (consumoRequest) => {
  const response = await fetch(`${API_URL}/analisis-energetico`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consumoRequest),
  });

  if (!response.ok) {
    throw new Error('Error al procesar el análisis energético');
  }

  return await response.json(); // Devuelve AnalisisResponse DTO
};

/**
 * Consulta un análisis específico por su ID.
 * @param {number|string} id ID del análisis
 * @returns {Promise<Object>} Promesa con AnalisisEntityDTO
 */
export const obtenerAnalisisPorId = async (id) => {
  const response = await fetch(`${API_URL}/analisis-energetico/${id}`);

  if (!response.ok) {
    throw new Error(`Error consultando el análisis con ID: ${id}`);
  }

  return await response.json(); // Devuelve AnalisisEntityDTO
};

/**
 * Verifica si el servicio backend está disponible.
 */
export const verificarEstadoHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.text();
  } catch (error) {
    console.warn('El backend no está respondiendo');
    return null;
  }
};

/**
 * Obtiene el listado completo de análisis realizados.
 * @returns {Promise<Array>} Lista de AnalisisEntityDTO
 */
export const obtenerHistorialAnalisis = async () => {
  const response = await fetch(`${API_URL}/analisis-energetico`);

  if (!response.ok) {
    throw new Error('Error al obtener el historial de análisis');
  }

  return await response.json();
};