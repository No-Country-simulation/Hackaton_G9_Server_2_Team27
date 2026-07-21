package com.hackaton.energiaapi.service;

import com.hackaton.energiaapi.dto.AnalisisRequestDTO;
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
    public AnalisisEnergetico procesarAnalisis(AnalisisRequestDTO request) {
        double consumoKwh = request.getConsumoKwh();
        double costoEstimadoMensual = consumoKwh * TARIFA_REFERENCIA_KWH;

        String categoria = "Indeterminado";
        double probabilidad = 0.0;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> mlResponse = restTemplate.postForObject(mlServiceUrl, request, Map.class);
            if (mlResponse != null) {
                if (mlResponse.containsKey("categoria")) {
                    categoria = (String) mlResponse.get("categoria");
                }
                if (mlResponse.containsKey("probabilidad")) {
                    probabilidad = Double.parseDouble(mlResponse.get("probabilidad").toString());
                }
            }
        } catch (Exception e) {
            log.warn("El servicio de Machine Learning no está disponible en {}. Usando lógica temporal simulada. Error: {}", mlServiceUrl, e.getMessage());
            categoria = determinarCategoria(consumoKwh);
            probabilidad = 0.88;
        }

        List<String> recomendaciones = generarRecomendaciones(request, categoria);

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

        return repository.save(entidad);
    }

    @Override
    public List<AnalisisEnergetico> obtenerHistorial() {
        return repository.findAllByOrderByFechaCreacionDesc();
    }

    @Override
    public AnalisisEnergetico obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Análisis no encontrado con id " + id));
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
            recomendaciones.add("Se detecta un consumo elevado por metro cuadrado. Considere revisar el aislamiento térmico y la eficiencia de los equipos.");
        }

        if (request.getHorasAltoConsumo() != null && request.getHorasAltoConsumo() > 6) {
            recomendaciones.add("Reduzca el tiempo de uso continuo de equipos de climatización o configure termostatos a 24°C.");
        }

        if ("Eficiente".equals(categoria)) {
            recomendaciones.add("¡Excelente hábito de consumo! Mantenga la programación actual de sus electrodomésticos.");
        }

        return recomendaciones;
    }
}
