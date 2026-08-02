package EnegiAI.Backend.controller;

import EnegiAI.Backend.dto.AnalisisEntityDTO;
import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.service.AnalisisEnergeticoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;


/**
 * Expone los endpoints REST encargados de recibir solicitudes relacionadas
 * con el análisis energético.
 *
 * Este controlador actúa como punto de entrada de la API, validando las
 * solicitudes recibidas y delegando el procesamiento al servicio de negocio,
 * para posteriormente devolver una respuesta HTTP apropiada.
 */
@RestController
public class AnalisisEnergeticoController {


    @Autowired
    private AnalisisEnergeticoService analisisEnergeticoService;
    /**
     * Recibe los datos de consumo enviados por el cliente e inicia el proceso
     * de análisis energético.
     *
     * La información recibida es validada automáticamente antes de ejecutar
     * la lógica de negocio. Una vez procesada, se devuelve el resultado del
     * análisis en formato JSON.
     *
     * @param consumoRequestJson Información de consumo suministrada por el usuario.
     * @return Respuesta HTTP con el resultado del análisis energético.
     */
        @PostMapping("/analisis-energetico")
        public ResponseEntity<AnalisisResponse> realizarAnalisis(@RequestBody @Valid ConsumoRequest consumoRequestJson){
            var analisis = analisisEnergeticoService.procesarAnalisis(consumoRequestJson);
            System.out.println("FUNCIONA!");
            return ResponseEntity.ok(analisis);
            //Retorna 200 OK no un 201 CREATED + BODY LOCATION, por ahora.
        }

        @GetMapping("/analisis-energetico/{id}")
        public ResponseEntity<AnalisisEntityDTO> consultarAnalisis(@PathVariable Long id){
            var analisis = analisisEnergeticoService.consultarAnalisis(id);
            return ResponseEntity.ok(analisis);

        }

        /**
     * Expone un endpoint de verificación para comprobar que la aplicación
     * se encuentra disponible y respondiendo correctamente.
     *
     * @return Mensaje indicando el estado operativo del servicio.
     */
        @GetMapping("/health")
        public String health() {
            return "Hola";
        }
}
