package EnegiAI.Backend.dto;

import java.util.List;

/**
 * DTO que encapsula las recomendaciones generadas para optimizar
 * el consumo energético del usuario.
 *
 * Este componente agrupa las acciones sugeridas por las reglas de
 * negocio con el objetivo de mejorar la eficiencia energética.
 */
public record RecomendacionesResponse(
        List<String> recomendaciones
) {
}
