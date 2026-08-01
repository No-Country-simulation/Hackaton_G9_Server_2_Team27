package EnegiAI.Backend.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;


/**
 * Representa el concepto completo de un analisis energetico, resultado
 * de combinar la clasificacion del modelo, las recomendaciones generadas
 * por reglas de negocio, y la estimacion financiera.
 *
 * Esta clase es el "dominio" — la version completa e interna del analisis.
 * El DTO AnalisisResponse decide que parte de esto se expone hacia afuera.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Embeddable
public class AnalisisEnergetico {
    @Enumerated(EnumType.STRING)
    private Categoria categoria;
    private double probabilidad;
    private double costoEstimadoMensual;
}