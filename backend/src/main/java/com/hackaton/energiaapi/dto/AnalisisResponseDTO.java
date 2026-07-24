package com.hackaton.energiaapi.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalisisResponseDTO {

    private String categoria;
    private Double probabilidad;
    private Double costoEstimadoMensual;
    private List<String> recomendaciones;

    private String prediccionFinalEnsamble;
    private String metodoDecision;
    private Boolean desempateAplicado;
    private Map<String, String> votosDetallados;
    private Map<String, String> precisionHistorica;
    private Map<String, Double> latenciaMs;
}
