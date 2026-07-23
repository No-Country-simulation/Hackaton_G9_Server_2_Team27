package EnegiAI.Backend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO que encapsula la información de consumo energético enviada por el
 * cliente para solicitar un análisis.
 *
 * Sus atributos incorporan reglas de validación mediante Bean Validation,
 * garantizando que únicamente se procesen solicitudes con datos válidos.
 */
public record ConsumoRequest(
        @NotNull(message = "El consumo en kWh es obligatorio")
        @Positive(message = "El consumo en kWh debe ser mayor a cero")
        Double consumo_kwh,

        @NotNull(message = "El campo de uso horario pico es obligatorio")
        Boolean uso_horario_pico,

        @NotNull(message = "La cantidad de equipos es obligatoria")
        @Positive(message = "La cantidad de equipos debe ser al menos 1")
        Integer cantidad_equipos,

        @NotBlank(message = "El tipo de inmueble no puede estar vacío")
        String tipo_inmueble,

        @NotNull(message = "Las horas de alto consumo son obligatorias")
        @PositiveOrZero(message = "Las horas de alto consumo no pueden ser negativas")
        @Min(value = 0, message = "Las horas de alto consumo no pueden ser menores a 0")
        @Max(value = 24, message = "Las horas de alto consumo no pueden ser mayores a 24")
        Integer horas_alto_consumo
) {
}
