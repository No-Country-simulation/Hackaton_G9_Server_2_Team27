package EnegiAI.Backend.telegram;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

/**
 * Registra el bot de Telegram ante la API oficial de Telegram al iniciar
 * la aplicación, dejándolo activo y a la escucha de mensajes entrantes.
 */
@Component
public class TelegramBotConfig {

    private final EnergiAIBot energiAIBot;

    public TelegramBotConfig(EnergiAIBot energiAIBot) {
        this.energiAIBot = energiAIBot;
    }

    @PostConstruct
    public void registrarBot() {
        try {
            TelegramBotsApi telegramBotsApi = new TelegramBotsApi(DefaultBotSession.class);
            telegramBotsApi.registerBot(energiAIBot);
            System.out.println("✅ Bot de Telegram registrado y escuchando mensajes.");
        } catch (TelegramApiException e) {
            System.err.println("❌ Error al registrar el bot de Telegram: " + e.getMessage());
        }
    }
}
