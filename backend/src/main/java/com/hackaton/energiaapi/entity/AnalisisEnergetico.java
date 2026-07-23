package com.hackaton.energiaapi.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalisisEnergetico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Input Fields
    private Double consumoKwh;
    private Boolean usoHorarioPico;
    private Integer cantidadEquipos;
    private String tipoInmueble;
    private Integer horasAltoConsumo;
    private Double metrosCuadrados;
    private Integer cantidadPersonas;

    // Output Fields (ML & Calculated)
    private String categoria;
    private Double probabilidad;
    private Double costoEstimadoMensual;

    @ElementCollection
    private List<String> recomendaciones;

    // Audit Field
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}
