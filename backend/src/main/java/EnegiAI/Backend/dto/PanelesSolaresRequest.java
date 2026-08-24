package EnegiAI.Backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO de entrada para calcular la cantidad de paneles solares necesarios
 * para cubrir un consumo eléctrico determinado.
 */
public record PanelesSolaresRequest(
        @NotNull(message = "El consumo en kWh es obligatorio")
        @Positive(message = "El consumo en kWh debe ser mayor a cero")
        Double consumoKwh,

        @NotNull(message = "Las horas de mayor índice solar son obligatorias")
        @Positive(message = "Las horas de mayor índice solar deben ser mayores a cero")
        Double horasSolPico
) {
}
