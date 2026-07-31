package EnegiAI.Backend.dto.fastAPI;

import java.util.Map;

public record DetallesModelos(
    Map<String, String> votos_detallados,
    String metodo_decision,
    Map<String, Double> latencias_ms
) {
}
