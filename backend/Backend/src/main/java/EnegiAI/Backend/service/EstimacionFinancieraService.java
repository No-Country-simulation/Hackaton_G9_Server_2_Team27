package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;

public class EstimacionFinancieraService {

    private static final double TARIFA_KWH = 0.75;

    public double calcularCostoMensual(ConsumoRequest request) {
        if (request.consumo_kwh() == null) return 0.0;
        return request.consumo_kwh() * TARIFA_KWH;
    }
}
