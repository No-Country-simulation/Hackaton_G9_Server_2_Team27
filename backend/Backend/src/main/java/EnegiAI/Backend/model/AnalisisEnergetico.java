package EnegiAI.Backend.model;

import lombok.*;
import java.util.List;

/**
 * Representa el concepto completo de un analisis energetico, resultado
 * de combinar la clasificacion del modelo, las recomendaciones generadas
 * por reglas de negocio, y la estimacion financiera.
 *
 * Esta clase es el "dominio" — la version completa e interna del analisis.
 * El DTO AnalisisResponse decide que parte de esto se expone hacia afuera.
 */
@AllArgsConstructor
@Getter

public class AnalisisEnergetico {

    private final Categoria categoria;
    private final double probabilidad;
    private final List<String> recomendaciones;
    private final double costoEstimadoMensual;
}