package com.hackaton.energiaapi.dto;

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
public class AnalisisRequestDTO {

    @NotNull(message = "El consumo no puede ser nulo")
    @Positive(message = "El consumo debe ser positivo")
    private Double consumoKwh;

    @NotNull(message = "El uso en horario pico no puede ser nulo")
    private Boolean usoHorarioPico;

    @NotNull(message = "La cantidad de equipos no puede ser nula")
    @Min(value = 1, message = "La cantidad de equipos debe ser mínimo 1")
    private Integer cantidadEquipos;

    @NotBlank(message = "El tipo de inmueble no puede estar vacío")
    private String tipoInmueble;

    @NotNull(message = "Las horas de alto consumo no pueden ser nulas")
    @Min(value = 0, message = "Las horas de alto consumo deben ser mínimo 0")
    @Max(value = 24, message = "Las horas de alto consumo deben ser máximo 24")
    private Integer horasAltoConsumo;

    @NotNull(message = "Los metros cuadrados no pueden ser nulos")
    @Positive(message = "Los metros cuadrados deben ser positivos")
    private Double metrosCuadrados;

    @NotNull(message = "La cantidad de personas no puede ser nula")
    @Min(value = 1, message = "La cantidad de personas debe ser mínimo 1")
    private Integer cantidadPersonas;
}
