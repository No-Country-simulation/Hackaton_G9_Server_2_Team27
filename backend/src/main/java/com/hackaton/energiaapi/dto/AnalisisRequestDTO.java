package com.hackaton.energiaapi.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AnalisisRequestDTO {

    @NotNull(message = "El consumo no puede ser nulo")
    @Positive(message = "El consumo debe ser positivo")
    @JsonAlias({"consumoKwh", "consumo_kwh"})
    private Double consumoKwh;

    @NotNull(message = "El uso en horario pico no puede ser nulo")
    @JsonAlias({"usoHorarioPico", "uso_horario_pico"})
    private Boolean usoHorarioPico;

    @NotNull(message = "La cantidad de equipos no puede ser nula")
    @Min(value = 1, message = "La cantidad de equipos debe ser mínimo 1")
    @JsonAlias({"cantidadEquipos", "cantidad_equipos"})
    private Integer cantidadEquipos;

    @NotBlank(message = "El tipo de inmueble no puede estar vacío")
    @JsonAlias({"tipoInmueble", "tipo_inmueble"})
    private String tipoInmueble;

    @NotNull(message = "Las horas de alto consumo no pueden ser nulas")
    @Min(value = 0, message = "Las horas de alto consumo deben ser mínimo 0")
    @Max(value = 24, message = "Las horas de alto consumo deben ser máximo 24")
    @JsonAlias({"horasAltoConsumo", "horas_alto_consumo"})
    private Integer horasAltoConsumo;

    @NotNull(message = "Los metros cuadrados no pueden ser nulos")
    @Positive(message = "Los metros cuadrados deben ser positivos")
    @JsonAlias({"metrosCuadrados", "metros_cuadrados"})
    private Double metrosCuadrados;

    @NotNull(message = "La cantidad de personas no puede ser nula")
    @Min(value = 1, message = "La cantidad de personas debe ser mínimo 1")
    @JsonAlias({"cantidadPersonas", "cantidad_personas"})
    private Integer cantidadPersonas;
}

