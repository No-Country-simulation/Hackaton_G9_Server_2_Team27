package EnegiAI.Backend.dto;

/**
 * DTO de salida con el resultado del cálculo de paneles solares
 * necesarios para cubrir un consumo eléctrico determinado.
 *
 * @param panelesNecesarios Cantidad de paneles solares requeridos.
 * @param generacionMensualKwh Energía que generarían esos paneles en un mes.
 * @param coberturaPorcentaje Porcentaje del consumo mensual que cubre la generación solar.
 * @param ahorroEstimadoMensual Ahorro económico estimado por mes, en la moneda de referencia del proyecto.
 */
public record PanelesSolaresResponse(
        int panelesNecesarios,
        double generacionMensualKwh,
        int coberturaPorcentaje,
        double ahorroEstimadoMensual
) {
}
