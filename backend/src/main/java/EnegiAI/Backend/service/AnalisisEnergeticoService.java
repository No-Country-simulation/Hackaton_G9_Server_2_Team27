package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.AnalisisEntityDTO;
import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.model.AnalisisEnergetico;
import EnegiAI.Backend.model.AnalisisEnergeticoEntity;
import EnegiAI.Backend.model.Categoria;
import EnegiAI.Backend.model.DatosConsumo;
import EnegiAI.Backend.repository.AnalisisEnergeticoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Orquesta el flujo completo del análisis energético solicitado por el usuario.
 *
 * Este servicio coordina los distintos componentes de la lógica de negocio:
 * obtiene la clasificación del consumo, genera las recomendaciones
 * correspondientes, calcula la estimación financiera y consolida los
 * resultados en el modelo de dominio antes de construir la respuesta
 * de la API.
 *
 * Actúa como el punto central del caso de uso "Realizar análisis energético",
 * manteniendo desacopladas las responsabilidades de cada servicio
 * especializado.
 */
@Service
public class AnalisisEnergeticoService {
    private final ClasificacionService clasificacionService;
    private final RecomendacionService recomendacionService;
    private final EstimacionFinancieraService estimacionFinancieraService;
    private final AnalisisEnergeticoRepository analisisEnergeticoRepository;

    /**
     * Inicializa el servicio inyectando las dependencias encargadas de cada
     * etapa del análisis energético.
     *
     * @param clasificacionService Servicio responsable de clasificar el consumo energético.
     * @param recomendacionService Servicio encargado de generar recomendaciones según la clasificación.
     * @param estimacionFinancieraService Servicio que calcula la estimación del costo mensual.
     */
    public AnalisisEnergeticoService(ClasificacionService clasificacionService,
                                     RecomendacionService recomendacionService,
                                     EstimacionFinancieraService estimacionFinancieraService,
                                     AnalisisEnergeticoRepository analisisEnergeticoRepository) {
        this.clasificacionService = clasificacionService;
        this.recomendacionService = recomendacionService;
        this.estimacionFinancieraService = estimacionFinancieraService;
        this.analisisEnergeticoRepository = analisisEnergeticoRepository;
    }

    /**
     * Ejecuta el flujo completo del análisis energético a partir de la
     * información de consumo proporcionada por el usuario.
     *
     * El proceso consiste en obtener la clasificación del consumo,
     * generar recomendaciones asociadas, calcular la estimación
     * financiera y consolidar los resultados en el modelo de dominio,
     * el cual posteriormente es transformado en el DTO de respuesta
     * expuesto por la API.
     *
     * @param request Información de consumo suministrada por el cliente.
     * @return Resultado completo del análisis energético listo para ser enviado como respuesta.
     */

    /*POST*/
    @Transactional
    public AnalisisResponse procesarAnalisis(ConsumoRequest request) {
        var clasificacion = clasificacionService.obtenerClasificacion(request);

        Categoria categoria = clasificacion.categoria();
        double probabilidad = clasificacion.probabilidad();
        DatosConsumo datosConsumo = new DatosConsumo(request);
        
        List<String> recomendaciones = clasificacion.recomendaciones();
        if (recomendaciones == null || recomendaciones.isEmpty()) {
            recomendaciones = recomendacionService.generarRecomendaciones(categoria);
        }
        double costoEstimado = estimacionFinancieraService.calcularCostoMensual(request);

        AnalisisEnergetico analisisEnergetico = new AnalisisEnergetico(
                categoria,
                probabilidad,
                costoEstimado
        );
        var entidad = new AnalisisEnergeticoEntity(analisisEnergetico, datosConsumo, recomendaciones);
        analisisEnergeticoRepository.save(entidad);
        return new AnalisisResponse(analisisEnergetico, recomendaciones);
    }
    /*GET{id} Un analisis individual*/
    public AnalisisEntityDTO consultarAnalisis(Long id) {
        AnalisisEnergeticoEntity entidad = analisisEnergeticoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Análisis no encontrado con id " + id));

        return new AnalisisEntityDTO(entidad);
    }

    /* GET /analisis-energetico - Listar historial */
    public List<AnalisisEntityDTO> listarHistorial() {
        return analisisEnergeticoRepository.findAll()
                .stream()
                .map(AnalisisEntityDTO::new)
                .toList();
    }
}
