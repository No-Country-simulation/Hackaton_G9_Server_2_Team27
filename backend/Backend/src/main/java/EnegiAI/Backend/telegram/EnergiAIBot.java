package EnegiAI.Backend.telegram;

import EnegiAI.Backend.model.TelegramVinculo;
import EnegiAI.Backend.repository.TelegramVinculoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

/**
 * Bot de Telegram encargado de vincular automáticamente el navegador del
 * usuario (identificado por un sessionId generado en el frontend) con su
 * chat de Telegram, mediante un enlace directo (deep link) con /start.
 */
@Component
public class EnergiAIBot extends TelegramLongPollingBot {

    private final String botUsername;
    private final TelegramVinculoRepository vinculoRepository;

    public EnergiAIBot(@Value("${telegram.bot.username}") String botUsername,
                        @Value("${telegram.bot.token}") String botToken,
                        TelegramVinculoRepository vinculoRepository) {
        super(botToken);
        this.botUsername = botUsername;
        this.vinculoRepository = vinculoRepository;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String chatId = update.getMessage().getChatId().toString();
            String textoRecibido = update.getMessage().getText().trim();

            if (textoRecibido.startsWith("/start")) {
                String sessionId = extraerSessionId(textoRecibido);

                if (sessionId != null) {
                    vincularAutomaticamente(chatId, sessionId);
                } else {
                    enviarMensaje(chatId, "¡Hola! Para vincular tu cuenta, entrá a la web de EnergiAI y tocá el botón de Telegram.");
                }
            } else {
                enviarMensaje(chatId, "No entendí ese mensaje. Para vincular tu cuenta, entrá a la web de EnergiAI y tocá el botón de Telegram.");
            }
        }
    }

    private String extraerSessionId(String textoRecibido) {
        String[] partes = textoRecibido.split(" ", 2);
        return partes.length == 2 ? partes[1].trim() : null;
    }

    private void vincularAutomaticamente(String chatId, String sessionId) {
        boolean yaExistia = vinculoRepository.findByCodigo(sessionId).isPresent();

        if (!yaExistia) {
            vinculoRepository.save(new TelegramVinculo(sessionId, chatId));
        }

        enviarMensaje(chatId, "✅ ¡Tu cuenta quedó vinculada! A partir de ahora, cada análisis que hagas en la web de EnergiAI te va a llegar acá automáticamente.");
    }

    private void enviarMensaje(String chatId, String texto) {
        SendMessage mensaje = new SendMessage();
        mensaje.setChatId(chatId);
        mensaje.setText(texto);
        mensaje.setParseMode("Markdown");

        try {
            execute(mensaje);
        } catch (TelegramApiException e) {
            System.err.println("[EnergiAIBot] Error al enviar mensaje: " + e.getMessage());
        }
    }
}
