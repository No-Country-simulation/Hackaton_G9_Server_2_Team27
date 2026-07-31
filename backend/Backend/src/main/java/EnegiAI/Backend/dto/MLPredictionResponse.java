package EnegiAI.Backend.dto;

import EnegiAI.Backend.model.Categoria;

/**
 * DTO que representa la respuesta cruda enviada por el servicio de
 * Machine Learning (FastAPI) tras clasificar el perfil energético.
 *
 * Mapea directamente el JSON {"categoria": "...", "probabilidad": ...}
 * devuelto por el modelo de Data Science.
 */
public record MLPredictionResponse(
        Categoria categoria,
        Double probabilidad
) {
}
