package EnegiAI.Backend.controller;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.service.AnalisisEnergeticoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;


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
        public ResponseEntity<?> realizarAnalisis(@RequestBody @Valid ConsumoRequest consumoRequestJson){
            System.out.println("FUNCIONA!");
            return ResponseEntity.ok(consumoRequestJson);
            //Retorna 200 OK no un 201 CREATED, dado que el análisis no persiste en ninguna BD aún
        }
//    @GetMapping("/analisis-energetico/{id}")

    /**
     * Expone un endpoint de verificación para comprobar que la aplicación
     * se encuentra disponible y respondiendo correctamente.
     *
     * @return Mensaje indicando el estado operativo del servicio.
     */
        @GetMapping("/health")
        public String health() {
            return AnalisisEnergeticoService.hola();
        }
}
