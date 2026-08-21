package EnegiAI.Backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

/**
 * DTO que encapsula la información de consumo energético enviada por el
 * cliente para solicitar un análisis.
 *
 * Sus atributos incorporan reglas de validación mediante Bean Validation,
 * garantizando que únicamente se procesen solicitudes con datos válidos.
 */
public record ConsumoRequest(
        @JsonProperty("consumo_kwh")
        @NotNull(message = "El consumo en kWh es obligatorio") 
        @Positive(message = "El consumo en kWh debe ser mayor a cero") 
        Double consumo_kwh,

        @JsonProperty("uso_horario_pico")
        @NotNull(message = "El campo de uso horario pico es obligatorio") 
        Boolean uso_horario_pico,

        @JsonProperty("cantidad_equipos")
        @NotNull(message = "La cantidad de equipos es obligatoria") 
        @Positive(message = "La cantidad de equipos debe ser al menos 1") 
        Integer cantidad_equipos,

        @JsonProperty("tipo_inmueble")
        @NotBlank(message = "El tipo de inmueble no puede estar vacío") 
        String tipo_inmueble,

        @JsonProperty("horas_alto_consumo")
        @NotNull(message = "Las horas de alto consumo son obligatorias") 
        @PositiveOrZero(message = "Las horas de alto consumo no pueden ser negativas") 
        @Min(value = 0, message = "Las horas de alto consumo no pueden ser menores a 0") 
        @Max(value = 24, message = "Las horas de alto consumo no pueden ser mayores a 24") 
        Integer horas_alto_consumo,

        @JsonProperty("metros_cuadrados")
        @NotNull(message = "Los metros cuadrados son obligatorios") 
        @Positive(message = "Los metros cuadrados deben ser mayores a cero") 
        Double metros_cuadrados,

        @JsonProperty("cantidad_personas")
        @NotNull(message = "La cantidad de personas es obligatoria") 
        @Positive(message = "La cantidad de personas debe ser al menos 1") 
        Integer cantidad_personas
) {}