package EnegiAI.Backend.telegram;

import EnegiAI.Backend.model.TelegramVinculo;
import EnegiAI.Backend.repository.TelegramVinculoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Bot de Telegram encargado de vincular el chat del usuario con el
 * formulario web (mediante un código temporal) y de entregarle los
 * resultados de sus análisis energéticos directamente en el chat.
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

            if (textoRecibido.equalsIgnoreCase("/vincular")) {
                responderVinculacion(chatId);
            } else if (textoRecibido.equalsIgnoreCase("/start")) {
                enviarMensaje(chatId, "¡Hola! Soy el bot de EnergiAI. Escribí /vincular para conectar tu cuenta y recibir tus resultados aquí.");
            } else {
                enviarMensaje(chatId, "No entendí ese mensaje. Escribí /vincular para conectar tu cuenta con la web de EnergiAI.");
            }
        }
    }

    private void responderVinculacion(String chatId) {
        String codigo = String.valueOf(ThreadLocalRandom.current().nextInt(1000, 9999));
        vinculoRepository.save(new TelegramVinculo(codigo, chatId));

        String texto = "Tu código de vinculación es: *" + codigo + "*\n\n" +
                "Copialo y pegalo en el formulario de la web de EnergiAI para recibir tus resultados aquí.";
        enviarMensaje(chatId, texto);
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
