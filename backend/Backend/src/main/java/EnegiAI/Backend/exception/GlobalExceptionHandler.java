package EnegiAI.Backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Centraliza el manejo de las excepciones producidas durante la ejecución
 * de la API REST.
 *
 * Esta clase intercepta las excepciones lanzadas por los controladores y
 * las transforma en respuestas HTTP con una estructura uniforme, evitando
 * exponer detalles internos de la aplicación y facilitando el consumo
 * consistente de los errores por parte del cliente.
 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Procesa los errores generados por las validaciones de los DTO de entrada.
     *
     * Cuando una solicitud incumple las restricciones definidas mediante
     * Bean Validation, este método construye una respuesta con código
     * HTTP 400 (Bad Request) que incluye el detalle de cada campo inválido.
     *
     * @param ex Excepción que contiene el resultado de las validaciones fallidas.
     * @return Respuesta HTTP con el detalle de los errores de validación.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.put(error.getField(), error.getDefaultMessage())
        );

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Solicitud invalida");
        body.put("detalles", errores);

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getReason());

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    /**
     * Maneja cualquier excepción no contemplada por otros controladores
     * de excepciones específicos.
     *
     * Su propósito es devolver una respuesta HTTP 500 (Internal Server Error)
     * con una estructura consistente, evitando que las excepciones lleguen
     * sin controlar hasta el cliente.
     *
     * @param ex Excepción producida durante el procesamiento de la solicitud.
     * @return Respuesta HTTP indicando un error interno del servidor.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Error interno del servidor");
        body.put("mensaje", ex.getMessage());

        return ResponseEntity.internalServerError().body(body);
    }
}
