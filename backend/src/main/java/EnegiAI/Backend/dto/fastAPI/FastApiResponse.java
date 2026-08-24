package EnegiAI.Backend.dto.fastAPI;

public record FastApiResponse(
        String categoria,
        Double probabilidad,
        Double costo_estimado_mensual,
        DetallesModelos detalles
) {}


