package EnegiAI.Backend.dto;

/**
 * DTO encargado de representar el resultado de la clasificación
 * energética obtenida durante el análisis.
 *
 * Contiene la categoría asignada por el modelo y el nivel de confianza
 * asociado a dicha predicción.
 */
public record CategoriaResponse(
        String categoria,
        Double probabilidad
) {
}
