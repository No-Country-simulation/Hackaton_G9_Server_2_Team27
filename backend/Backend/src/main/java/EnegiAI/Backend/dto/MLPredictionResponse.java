package EnegiAI.Backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.List;

public record MLPredictionResponse(
        @JsonProperty("categoria") String categoria,
        @JsonProperty("probabilidad") Double probabilidad,
        @JsonProperty("detalles") DetallesPrediccion detalles,
        @JsonProperty("recomendaciones") List<String> recomendaciones
) {}

record DetallesPrediccion(
        @JsonProperty("votos_detallados") Map<String, String> votos_detallados,
        @JsonProperty("metodo_decision") String metodo_decision,
        @JsonProperty("latencias_ms") Map<String, Double> latencias_ms
) {}
