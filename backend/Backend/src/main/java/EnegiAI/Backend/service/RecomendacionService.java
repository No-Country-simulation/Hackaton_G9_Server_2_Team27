package EnegiAI.Backend.service;

import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Genera las recomendaciones de eficiencia energética a partir de la
 * categoría obtenida durante el proceso de clasificación.
 *
 * Este servicio encapsula las reglas de negocio encargadas de determinar
 * las acciones sugeridas para el usuario según su nivel de eficiencia
 * energética, manteniendo esta lógica desacoplada del resto del proceso
 * de análisis.
 */
@Service
public class RecomendacionService {

    /**
     * Obtiene las recomendaciones asociadas a una categoría energética.
     *
     * Cada categoría posee un conjunto de recomendaciones orientadas a
     * promover un consumo más eficiente de la energía.
     *
     * @param categoria Categoría energética asignada durante el análisis.
     * @return Lista de recomendaciones correspondientes a la categoría.
     * @throws IllegalStateException Si la categoría recibida no es válida.
     */
    public List<String> generarRecomendaciones(Categoria categoria) {
        if (categoria == null) {
            throw new IllegalArgumentException("La categoría no puede ser nula.");
        }

        return switch (categoria) {
            case Eficiente -> List.of(
                    "¡Buen trabajo! Tu consumo se encuentra dentro de parámetros estables."
            );
            case Moderado -> List.of(
                    "Tu consumo eléctrico es moderado, sigue las recomendaciones en EnergiIA."
            );
            case Ineficiente -> List.of(
                    "Tu consumo eléctrico es alto, te recomendamos seguir las instrucciones de EnergiIA."
            );
        };
    }
}
