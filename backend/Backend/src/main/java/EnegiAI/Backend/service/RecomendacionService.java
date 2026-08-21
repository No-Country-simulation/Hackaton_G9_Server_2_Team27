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
                    "¡Excelente trabajo! Tu perfil energético está altamente optimizado.",
                    "Sigue aprovechando la luz natural durante el día para minimizar el uso de iluminación artificial.",
                    "Considera integrar un pequeño panel solar o baterías de respaldo para ser aún más autosuficiente.",
                    "Mantén el ciclo regular de mantenimiento en tus equipos para asegurar que no pierdan eficiencia."
            );
            case Moderado -> List.of(
                    "Identifica y desconecta equipos que se queden en modo de espera (standby) cuando no los usas.",
                    "Ajusta la temperatura de los sistemas de climatización (aire acondicionado o calefacción) a niveles moderados.",
                    "Planea renovar gradualmente tus electrodomésticos por aquellos con certificación de alta eficiencia energética.",
                    "Considera agrupar las actividades de mayor consumo (como lavado de ropa) fuera del horario pico."
            );
            case Ineficiente -> List.of(
                    "Reduce drásticamente el uso de equipos pesados durante las horas pico de la red eléctrica.",
                    "Reemplaza de forma urgente cualquier bombilla incandescente o halógena por tecnología LED.",
                    "Revisa posibles fugas de aire frío/caliente en puertas y ventanas que fuercen tu climatización.",
                    "Analiza tu historial para detectar qué aparato específico está disparando el consumo mensual."
            );
        };
    }
}
