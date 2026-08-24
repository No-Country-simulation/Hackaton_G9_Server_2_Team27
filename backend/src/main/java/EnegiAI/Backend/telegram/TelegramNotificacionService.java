package EnegiAI.Backend.telegram;

import EnegiAI.Backend.dto.AnalisisResponse;
import EnegiAI.Backend.repository.TelegramVinculoRepository;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

/**
 * Servicio encargado de entregar los resultados de un análisis energético
 * al usuario a través de Telegram, utilizando el código de vinculación
 * generado previamente por el bot.
 */
@Service
public class TelegramNotificacionService {

    private final TelegramVinculoRepository vinculoRepository;
    private final EnergiAIBot bot;

    public TelegramNotificacionService(TelegramVinculoRepository vinculoRepository, EnergiAIBot bot) {
        this.vinculoRepository = vinculoRepository;
        this.bot = bot;
    }

    /**
     * Busca el chat de Telegram asociado al código de vinculación y le
     * envía el resultado del análisis con formato de factura.
     *
     * @param codigo Código de vinculación generado por el bot.
     * @param analisis Resultado del análisis energético a enviar.
     * @return true si el mensaje se envió correctamente, false si el
     *         código no existe o el envío falló.
     */
    public boolean notificarResultado(String codigo, AnalisisResponse analisis) {
        var vinculoOpt = vinculoRepository.findByCodigo(codigo);

        if (vinculoOpt.isEmpty()) {
            System.err.println("[TelegramNotificacionService] Código no encontrado: " + codigo);
            return false;
        }

        String chatId = vinculoOpt.get().getChatId();
        String mensaje = construirFactura(analisis);

        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText(mensaje);
        sendMessage.setParseMode("Markdown");

        try {
            bot.execute(sendMessage);
            return true;
        } catch (TelegramApiException e) {
            System.err.println("[TelegramNotificacionService] Error al enviar: " + e.getMessage());
            return false;
        }
    }

    private String construirFactura(AnalisisResponse analisis) {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        StringBuilder sb = new StringBuilder();
        sb.append("🧾 *Factura de Análisis Energético — EnergiAI*\n");
        sb.append("_").append(fecha).append("_\n\n");
        sb.append("*Categoría:* ").append(escaparMarkdown(analisis.categoria().categoria())).append("\n");
        sb.append("*Probabilidad:* ").append(analisis.categoria().probabilidad()).append("\n");
        sb.append("*Costo estimado mensual:* $").append(analisis.estimacionFinanciera().costoEstimadoMensual()).append("\n\n");
        sb.append("*Recomendaciones:*\n");
        analisis.recomendaciones().recomendaciones().forEach(r -> sb.append("• ").append(escaparMarkdown(r)).append("\n"));
        sb.append("\n_Gracias por usar EnergiAI._");

        return sb.toString();
    }

    private String escaparMarkdown(String texto) {
        if (texto == null) return "";
        return texto.replace("_", "\\_")
                    .replace("*", "\\*")
                    .replace("[", "\\[")
                    .replace("]", "\\]")
                    .replace("`", "\\`");
    }
}
