package EnegiAI.Backend.dto;

/**
 * DTO encargado de representar la estimación económica derivada
 * del análisis energético.
 *
 * Contiene la proyección del costo mensual calculado a partir de
 * la información de consumo suministrada por el usuario.
 */
public record EstimacionFinancieraResponse(
        Double costoEstimadoMensual
) {
}
