package com.hackaton.energiaapi.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AnalisisResponseDTO {

    private Long id;
    private String categoria;
    private Double probabilidad;
    private Double costoEstimadoMensual;
    private List<String> recomendaciones;
    private DetallesDTO detalles;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class DetallesDTO {
        private Map<String, String> votosDetallados;
        private String metodoDecision;
        private Map<String, Double> latenciasMs;
    }
}
