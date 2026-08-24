package EnegiAI.Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity

@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class AnalisisEnergeticoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Boolean activo = true;
    @Embedded
    AnalisisEnergetico analisisEnergetico;
    @Embedded
    DatosConsumo datosConsumo;
    @ElementCollection
    private List<String> recomendaciones;
    private LocalDateTime fechaConsulta;

    public AnalisisEnergeticoEntity(
            AnalisisEnergetico analisisEnergetico,
            DatosConsumo datosConsumo,
            List<String> recomendaciones
    ) {
        this.id = null;
        this.activo = true;
        this.analisisEnergetico = analisisEnergetico;
        this.datosConsumo = datosConsumo;
        this.recomendaciones = recomendaciones;
        this.fechaConsulta = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {this.fechaConsulta = LocalDateTime.now();}
    public void eliminar() {
        this.activo = false;
    }

}
