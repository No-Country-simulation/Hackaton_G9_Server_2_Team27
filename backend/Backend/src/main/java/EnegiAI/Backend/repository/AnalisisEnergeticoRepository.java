package EnegiAI.Backend.repository;

import EnegiAI.Backend.model.AnalisisEnergeticoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalisisEnergeticoRepository extends JpaRepository<AnalisisEnergeticoEntity, Long> {
    List<AnalisisEnergeticoEntity> findAllByActivoTrueOrderByFechaConsultaDesc();
}
