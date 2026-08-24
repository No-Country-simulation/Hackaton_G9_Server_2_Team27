package EnegiAI.Backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Relaciona un código temporal generado por el bot de Telegram con el
 * chat_id del usuario que lo solicitó, permitiendo vincular el formulario
 * web con el chat de Telegram sin necesidad de un sistema de login.
 */
@Entity
public class TelegramVinculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String chatId;

    private LocalDateTime fechaCreacion;

    public TelegramVinculo() {
    }

    public TelegramVinculo(String codigo, String chatId) {
        this.codigo = codigo;
        this.chatId = chatId;
    }

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getChatId() {
        return chatId;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
