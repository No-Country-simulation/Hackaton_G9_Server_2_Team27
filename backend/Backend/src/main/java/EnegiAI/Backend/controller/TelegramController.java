package EnegiAI.Backend.controller;

import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.telegram.TelegramNotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Expone el endpoint encargado de enviar por Telegram el resultado de un
 * análisis energético ya calculado, a partir de un código de vinculación
 * generado previamente por el bot.
 */
@RestController
@CrossOrigin(origins = "*")
public class TelegramController {

    private final TelegramNotificacionService notificacionService;

    public TelegramController(TelegramNotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    /**
     * Envía por Telegram el resultado de un análisis ya calculado, al chat
     * vinculado con el código indicado.
     *
     * @param codigo Código de vinculación generado por el bot con /vincular.
     * @param analisis Resultado del análisis energético a enviar.
     * @return 200 OK si se envió correctamente, 404 si el código no existe
     *         o el envío falló.
     */
    @PostMapping("/telegram/notificar/{codigo}")
    public ResponseEntity<String> notificar(@PathVariable String codigo, @RequestBody AnalisisResponse analisis) {
        boolean enviado = notificacionService.notificarResultado(codigo, analisis);

        if (enviado) {
            return ResponseEntity.ok("Resultado enviado por Telegram correctamente.");
        } else {
            return ResponseEntity.status(404).body("Código de vinculación no encontrado o error al enviar.");
        }
    }
}
