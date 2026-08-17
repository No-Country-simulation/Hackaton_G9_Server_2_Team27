package EnegiAI.Backend.controller;

import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.repository.TelegramVinculoRepository;
import EnegiAI.Backend.telegram.TelegramNotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Expone los endpoints encargados de vincular el navegador del usuario
 * con Telegram y de enviarle por ese medio el resultado de sus análisis
 * energéticos ya calculados.
 */
@RestController
@CrossOrigin(origins = "*")
public class TelegramController {

    private final TelegramNotificacionService notificacionService;
    private final TelegramVinculoRepository vinculoRepository;

    public TelegramController(TelegramNotificacionService notificacionService,
                               TelegramVinculoRepository vinculoRepository) {
        this.notificacionService = notificacionService;
        this.vinculoRepository = vinculoRepository;
    }

    /**
     * Consulta si un sessionId de navegador ya fue vinculado a un chat
     * de Telegram. El frontend llama a este endpoint en loop luego de
     * mostrarle al usuario el botón/QR de vinculación.
     *
     * @param sessionId Identificador generado y guardado por el navegador.
     * @return Un objeto con "vinculado": true o false.
     */
    @GetMapping("/telegram/vinculado/{sessionId}")
    public ResponseEntity<Map<String, Boolean>> consultarVinculacion(@PathVariable String sessionId) {
        boolean vinculado = vinculoRepository.findByCodigo(sessionId).isPresent();
        return ResponseEntity.ok(Map.of("vinculado", vinculado));
    }

    /**
     * Envía por Telegram el resultado de un análisis ya calculado, al chat
     * vinculado con el sessionId indicado.
     *
     * @param sessionId Identificador del navegador ya vinculado.
     * @param analisis Resultado del análisis energético a enviar.
     * @return 200 OK si se envió correctamente, 404 si el sessionId no
     *         está vinculado o el envío falló.
     */
    @PostMapping("/telegram/notificar/{sessionId}")
    public ResponseEntity<String> notificar(@PathVariable String sessionId, @RequestBody AnalisisResponse analisis) {
        boolean enviado = notificacionService.notificarResultado(sessionId, analisis);

        if (enviado) {
            return ResponseEntity.ok("Resultado enviado por Telegram correctamente.");
        } else {
            return ResponseEntity.status(404).body("Este navegador no está vinculado a Telegram.");
        }
    }
}
