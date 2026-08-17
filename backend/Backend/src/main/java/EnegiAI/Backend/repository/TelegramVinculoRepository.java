package EnegiAI.Backend.repository;

import EnegiAI.Backend.model.TelegramVinculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TelegramVinculoRepository extends JpaRepository<TelegramVinculo, Long> {
    Optional<TelegramVinculo> findByCodigo(String codigo);
}
