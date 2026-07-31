package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import org.springframework.stereotype.Service;

/**
 * Genera una predicción por defecto cuando el servicio de Machine Learning
 * no responde o devuelve una respuesta inválida.
 *
 * Este mecanismo de recuperación garantiza que el flujo del análisis
 * energético pueda completarse incluso ante fallos del servicio externo,
 * proporcionando un resultado consistente al resto de la aplicación.
 *
 * @return Predicción de respaldo utilizada como mecanismo de recuperación.
 */
@Service
public class EstimacionFinancieraService {

    private static final double TARIFA_KWH = 0.75;

    public double calcularCostoMensual(ConsumoRequest request) {
        if (request.consumo_kwh() == null) return 0.0;
        return request.consumo_kwh() * TARIFA_KWH;
    }
}
