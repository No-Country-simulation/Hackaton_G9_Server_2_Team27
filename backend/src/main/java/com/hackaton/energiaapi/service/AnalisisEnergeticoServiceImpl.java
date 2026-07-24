package com.hackaton.energiaapi.service;

import com.hackaton.energiaapi.dto.AnalisisRequestDTO;
import com.hackaton.energiaapi.dto.AnalisisResponseDTO;
import com.hackaton.energiaapi.entity.AnalisisEnergetico;
import com.hackaton.energiaapi.repository.AnalisisEnergeticoRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalisisEnergeticoServiceImpl implements AnalisisEnergeticoService {

    private static final double TARIFA_REFERENCIA_KWH = 0.75;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final AnalisisEnergeticoRepository repository;

    @Override
    public AnalisisResponseDTO procesarAnalisis(AnalisisRequestDTO request) {
        double consumoKwh = request.getConsumoKwh();
        double costoEstimadoMensual = consumoKwh * TARIFA_REFERENCIA_KWH;

        String categoria = "Indeterminado";
        double probabilidad = 0.0;
        String prediccionFinalEnsamble = null;
        String metodoDecision = null;
        Boolean desempateAplicado = null;
        Map<String, String> votosDetallados = null;
        Map<String, String> precisionHistorica = null;
        Map<String, Double> latenciaMs = null;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> mlResponse = restTemplate.postForObject(mlServiceUrl, request, Map.class);
            if (mlResponse != null) {
                if (mlResponse.containsKey("prediccion_final_ensamble")) {
                    categoria = (String) mlResponse.get("prediccion_final_ensamble");
                    prediccionFinalEnsamble = categoria;
                }
                if (mlResponse.containsKey("metodo_decision")) {
                    metodoDecision = (String) mlResponse.get("metodo_decision");
                }
                if (mlResponse.containsKey("desempate_aplicado")) {
                    desempateAplicado = (Boolean) mlResponse.get("desempate_aplicado");
                }
                if (mlResponse.containsKey("votos_detallados")) {
                    votosDetallados = (Map<String, String>) mlResponse.get("votos_detallados");
                }
                if (mlResponse.containsKey("precision_historica")) {
                    precisionHistorica = (Map<String, String>) mlResponse.get("precision_historica");
                }
                if (mlResponse.containsKey("latencia_ms")) {
                    latenciaMs = (Map<String, Double>) mlResponse.get("latencia_ms");
                }

                // Calcular probabilidad basada en consenso o desempate
                if (desempateAplicado != null && votosDetallados != null) {
                    if (Boolean.TRUE.equals(desempateAplicado)) {
                        probabilidad = 0.8625; // Precisión de XGBoost que desempata
                    } else {
                        long votosUnicos = votosDetallados.values().stream().distinct().count();
                        if (votosUnicos == 1) {
                            probabilidad = 1.0; // 3 de 3 coinciden
                        } else {
                            probabilidad = 0.6667; // 2 de 3 coinciden
                        }
                    }
                } else {
                    probabilidad = 0.85;
                }
            }
        } catch (Exception e) {
            log.warn(
                    "El servicio de Machine Learning no está disponible en {}. Usando lógica temporal simulada. Error: {}",
                    mlServiceUrl, e.getMessage());
            categoria = determinarCategoria(consumoKwh);
            probabilidad = 0.88;
            prediccionFinalEnsamble = categoria;
            metodoDecision = "Lógica de Fallback Local";
            desempateAplicado = false;
        }

        // Recomendaciones contextuales (basadas en los datos del request) +
        // Recomendaciones por categoría (requeridas por el Hackathon)
        List<String> recomendaciones = new ArrayList<>();
        recomendaciones.addAll(generarRecomendaciones(request, categoria));
        recomendaciones.addAll(obtenerRecomendaciones(categoria));

        // Persistir la entidad completa para conservar el historial en DB
        AnalisisEnergetico entidad = AnalisisEnergetico.builder()
                .consumoKwh(request.getConsumoKwh())
                .usoHorarioPico(request.getUsoHorarioPico())
                .cantidadEquipos(request.getCantidadEquipos())
                .tipoInmueble(request.getTipoInmueble())
                .horasAltoConsumo(request.getHorasAltoConsumo())
                .metrosCuadrados(request.getMetrosCuadrados())
                .cantidadPersonas(request.getCantidadPersonas())
                .categoria(categoria)
                .probabilidad(probabilidad)
                .costoEstimadoMensual(costoEstimadoMensual)
                .recomendaciones(recomendaciones)
                .build();

        AnalisisEnergetico entidadGuardada = repository.save(entidad);

        return AnalisisResponseDTO.builder()
                .categoria(entidadGuardada.getCategoria())
                .probabilidad(entidadGuardada.getProbabilidad())
                .costoEstimadoMensual(entidadGuardada.getCostoEstimadoMensual())
                .recomendaciones(entidadGuardada.getRecomendaciones())
                .prediccionFinalEnsamble(prediccionFinalEnsamble)
                .metodoDecision(metodoDecision)
                .desempateAplicado(desempateAplicado)
                .votosDetallados(votosDetallados)
                .precisionHistorica(precisionHistorica)
                .latenciaMs(latenciaMs)
                .build();
    }

    @Override
    public List<AnalisisEnergetico> obtenerHistorial() {
        return repository.findAllByOrderByFechaCreacionDesc();
    }

    @Override
    public AnalisisEnergetico obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Análisis no encontrado con id " + id));
    }

    private String determinarCategoria(double consumoKwh) {
        if (consumoKwh < 200) {
            return "Eficiente";
        } else if (consumoKwh <= 400) {
            return "Moderado";
        } else {
            return "Ineficiente";
        }
    }

    private List<String> generarRecomendaciones(AnalisisRequestDTO request, String categoria) {
        List<String> recomendaciones = new ArrayList<>();

        if (Boolean.TRUE.equals(request.getUsoHorarioPico())) {
            recomendaciones.add("Evite encender electrodomésticos de alto consumo entre las 18:00 y las 22:00 hs.");
        }

        if ("Ineficiente".equals(categoria)) {
            recomendaciones.add(
                    "Se detecta un consumo elevado por metro cuadrado. Considere revisar el aislamiento térmico y la eficiencia de los equipos.");
        }

        if (request.getHorasAltoConsumo() != null && request.getHorasAltoConsumo() > 6) {
            recomendaciones.add(
                    "Reduzca el tiempo de uso continuo de equipos de climatización o configure termostatos a 24°C.");
        }

        if ("Eficiente".equals(categoria)) {
            recomendaciones
                    .add("¡Excelente hábito de consumo! Mantenga la programación actual de sus electrodomésticos.");
        }

        return recomendaciones;
    }

    /**
     * Devuelve recomendaciones estándar de ahorro energético basadas en la
     * categoría del análisis, según los criterios del Hackathon ONE G9.
     */
    private List<String> obtenerRecomendaciones(String categoria) {
        List<String> recomendaciones = new ArrayList<>();
        switch (categoria) {
            case "Ineficiente" -> {
                recomendaciones.add(
                        "Reemplace equipos de más de 10 años por modelos con etiqueta de eficiencia energética A o superior.");
                recomendaciones.add(
                        "Realice una auditoría energética profesional para identificar los principales puntos de fuga de energía.");
                recomendaciones.add(
                        "Considere instalar paneles solares para reducir la dependencia de la red eléctrica en un 40-60%.");
            }
            case "Moderado" -> {
                recomendaciones.add(
                        "Instale temporizadores o enchufes inteligentes en dispositivos en modo espera (stand-by).");
                recomendaciones.add(
                        "Optimice el uso del aire acondicionado: cada grado por encima de 24°C puede ahorrar hasta un 8% de energía.");
                recomendaciones.add("Utilice iluminación LED de bajo consumo en todos los ambientes del inmueble.");
            }
            case "Eficiente" -> {
                recomendaciones
                        .add("Continúe monitoreando su consumo mensualmente para detectar desviaciones a tiempo.");
                recomendaciones
                        .add("Comparta sus buenas prácticas energéticas con otros miembros de su comunidad o empresa.");
            }
            default -> recomendaciones.add(
                    "Registre su consumo durante al menos 3 meses para obtener recomendaciones personalizadas más precisas.");
        }
        return recomendaciones;
    }
}
