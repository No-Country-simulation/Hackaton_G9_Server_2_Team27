const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Consulta el estado de vinculación de un sessionId con Telegram
 * @param {string} sessionId ID de la sesión generada en el frontend
 * @returns {Promise<boolean>} Promesa con true si está vinculado, false si no
 */
export const consultarVinculacionTelegram = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/telegram/vinculado/${sessionId}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.vinculado;
  } catch (error) {
    console.error('Error al consultar vinculación de Telegram:', error);
    return false;
  }
};

/**
 * Notifica los resultados del análisis a través de Telegram
 * @param {string} sessionId ID de la sesión generada en el frontend
 * @param {Object} analisisResponse Objeto con los resultados del análisis
 * @returns {Promise<boolean>} Promesa con true si se envió correctamente, false si falló
 */
export const notificarTelegram = async (sessionId, analisisResponse) => {
  try {
    const response = await fetch(`${API_URL}/telegram/notificar/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analisisResponse),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error al enviar notificación por Telegram:', error);
    return false;
  }
};
