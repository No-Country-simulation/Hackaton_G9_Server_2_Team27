package com.hackaton.energiaapi.dto;

import java.util.List;
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
}
