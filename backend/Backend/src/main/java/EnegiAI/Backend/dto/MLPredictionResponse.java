package EnegiAI.Backend.dto;

import java.util.Map;

public record MLPredictionResponse(
        String categoria,
        Double probabilidad,
        DetallesPrediccion detalles,
        java.util.List<String> recomendaciones
) {}

record DetallesPrediccion(
        Map<String, String> votos_detallados,
        String metodo_decision,
        Map<String, Double> latencias_ms
) {}
