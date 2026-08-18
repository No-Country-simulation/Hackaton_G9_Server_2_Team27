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
/**
 * Consulta si el sessionId del navegador ya fue vinculado a un chat
 * de Telegram.
 * @param {string} sessionId Identificador generado por el navegador.
 * @returns {Promise<boolean>} true si ya está vinculado.
 */
export const consultarVinculacionTelegram = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/telegram/vinculado/${sessionId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.vinculado === true;
  } catch (error) {
    console.warn('No se pudo consultar la vinculación de Telegram');
    return false;
  }
};

/**
 * Envía por Telegram el resultado de un análisis ya calculado, al chat
 * vinculado con el sessionId del navegador.
 * @param {string} sessionId Identificador del navegador ya vinculado.
 * @param {Object} analisis Resultado del análisis (AnalisisResponse).
 */
export const notificarResultadoPorTelegram = async (sessionId, analisis) => {
  try {
    await fetch(`${API_URL}/telegram/notificar/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analisis),
    });
  } catch (error) {
    console.warn('No se pudo enviar el resultado por Telegram');
  }
};
