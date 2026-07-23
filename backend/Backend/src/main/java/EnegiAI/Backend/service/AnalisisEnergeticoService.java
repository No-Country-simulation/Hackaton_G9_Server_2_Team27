package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.model.AnalisisEnergetico;
import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalisisEnergeticoService {
    private final ClasificacionService clasificacionService;
    private final RecomendacionService recomendacionService;
    private final EstimacionFinancieraService estimacionFinancieraService;

    // Inyección de dependencias por constructor
    public AnalisisEnergeticoService(ClasificacionService clasificacionService,
                                     RecomendacionService recomendacionService,
                                     EstimacionFinancieraService estimacionFinancieraService) {
        this.clasificacionService = clasificacionService;
        this.recomendacionService = recomendacionService;
        this.estimacionFinancieraService = estimacionFinancieraService;
    }

    public AnalisisResponse procesarAnalisis(ConsumoRequest request) {
        var clasificacion = clasificacionService.obtenerClasificacion(request);

        Categoria categoria = clasificacion.categoria();
        double probabilidad = clasificacion.probabilidad();

        List<String> recomendaciones = recomendacionService.generarRecomendaciones(request);
        double costoEstimado = estimacionFinancieraService.calcularCostoMensual(request);

        // 2. Crear la entidad de dominio
        AnalisisEnergetico analisisEnergetico = new AnalisisEnergetico(
                categoria,
                probabilidad,
                recomendaciones,
                costoEstimado
        );

        // 3. Retornar el DTO usando el constructor
        return new AnalisisResponse(analisisEnergetico);
    }
}
