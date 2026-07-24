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
import org.springframework.http.ResponseEntity;
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
        double costoEstimado = request.getConsumoKwh() * TARIFA_REFERENCIA_KWH;

        // Valores por defecto (fallback en caso de error de comunicación con ML)
        String categoria = "Moderado";
        double probabilidad = 0.85;
        Map<String, String> votosDetallados = null;
        String metodoDecision = "Predicción por fallback (servicio ML offline)";
        Map<String, Double> latenciasMs = null;

        // ── Llamada al servicio ML (FastAPI) ──────────────────────────────────
        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(mlServiceUrl, request, Map.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mlResponse = responseEntity.getBody();

                // Raíz: "categoria" y "probabilidad"
                if (mlResponse.containsKey("categoria")) {
                    categoria = (String) mlResponse.get("categoria");
                }
                if (mlResponse.containsKey("probabilidad")) {
                    probabilidad = ((Number) mlResponse.get("probabilidad")).doubleValue();
                }

                // Objeto anidado: "detalles" → votos_detallados, metodo_decision, latencias_ms
                if (mlResponse.get("detalles") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> detallesMap = (Map<String, Object>) mlResponse.get("detalles");

                    if (detallesMap.containsKey("metodo_decision")) {
                        metodoDecision = (String) detallesMap.get("metodo_decision");
                    }
                    if (detallesMap.containsKey("votos_detallados")) {
                        @SuppressWarnings("unchecked")
                        Map<String, String> votos = (Map<String, String>) detallesMap.get("votos_detallados");
                        votosDetallados = votos;
                    }
                    if (detallesMap.containsKey("latencias_ms")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Double> latencias = (Map<String, Double>) detallesMap.get("latencias_ms");
                        latenciasMs = latencias;
                    }
                }

                log.info("[ML] Categoría: {} | Probabilidad: {} | Método: {}", categoria, probabilidad, metodoDecision);
            }
        } catch (Exception e) {
            log.warn("[EnergiAI] Fallo de comunicación con ML-service ({}); ejecutando fallback local.", e.getMessage());
            categoria = determinarCategoria(request.getConsumoKwh());
            probabilidad = 0.88;
            metodoDecision = "Lógica de Fallback Local";
        }

        // ── Recomendaciones (contextuales + por categoría) ───────────────────
        List<String> recomendaciones = new ArrayList<>();
        recomendaciones.addAll(generarRecomendaciones(request, categoria));
        recomendaciones.addAll(obtenerRecomendaciones(categoria));

        // ── Persistencia en H2 ───────────────────────────────────────────────
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
                .costoEstimadoMensual(costoEstimado)
                .recomendaciones(recomendaciones)
                .build();

        entidad = repository.save(entidad);

        // ── Construcción del ResponseDTO con estructura anidada ───────────────
        AnalisisResponseDTO.DetallesDTO detallesDTO = AnalisisResponseDTO.DetallesDTO.builder()
                .votosDetallados(votosDetallados)
                .metodoDecision(metodoDecision)
                .latenciasMs(latenciasMs)
                .build();

        return AnalisisResponseDTO.builder()
                .id(entidad.getId())
                .categoria(categoria)
                .probabilidad(probabilidad)
                .costoEstimadoMensual(costoEstimado)
                .recomendaciones(recomendaciones)
                .detalles(detallesDTO)
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

    // ── Helpers privados ─────────────────────────────────────────────────────

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
