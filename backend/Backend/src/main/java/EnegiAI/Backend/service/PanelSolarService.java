package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.PanelesSolaresRequest;
import EnegiAI.Backend.dto.PanelesSolaresResponse;
import org.springframework.stereotype.Service;

/**
 * Servicio encargado de calcular la cantidad de paneles solares necesarios
 * para cubrir un consumo eléctrico determinado, junto con la generación
 * mensual estimada, el porcentaje de cobertura y el ahorro económico.
 *
 * Utiliza la misma tarifa de referencia (R$ 0,75/kWh) que el resto del
 * proyecto, junto con valores estándar de paneles solares residenciales
 * (400W, 80% de eficiencia).
 */
@Service
public class PanelSolarService {

    private static final double TARIFA_KWH = 0.75;
    private static final double WATTS_PANEL = 400;
    private static final double EFICIENCIA = 0.8;
    private static final int DIAS_POR_MES = 30;

    /**
     * Calcula la cantidad de paneles solares necesarios y sus métricas
     * asociadas, a partir del consumo mensual y las horas de mayor índice
     * solar indicadas por el usuario.
     *
     * @param request Consumo mensual en kWh y horas de mayor índice solar.
     * @return Resultado del cálculo: paneles necesarios, generación mensual,
     *         porcentaje de cobertura y ahorro estimado.
     */
    public PanelesSolaresResponse calcular(PanelesSolaresRequest request) {
        double consumoMensualKwh = request.consumoKwh();
        double horasSolPico = request.horasSolPico();

        double consumoDiarioKwh = consumoMensualKwh / DIAS_POR_MES;

        double generacionPorPanelDiaKwh = (WATTS_PANEL / 1000) * horasSolPico * EFICIENCIA;

        int panelesNecesarios = (int) Math.ceil(consumoDiarioKwh / generacionPorPanelDiaKwh);

        double generacionMensualKwh = generacionPorPanelDiaKwh * panelesNecesarios * DIAS_POR_MES;

        int coberturaPorcentaje = (int) Math.min(100,
                Math.round((generacionMensualKwh / consumoMensualKwh) * 100));

        double ahorroEstimadoMensual = Math.min(consumoMensualKwh, generacionMensualKwh) * TARIFA_KWH;

        return new PanelesSolaresResponse(
                panelesNecesarios,
                Math.round(generacionMensualKwh * 100.0) / 100.0,
                coberturaPorcentaje,
                Math.round(ahorroEstimadoMensual * 100.0) / 100.0
        );
    }
}
