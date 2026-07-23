package com.hackaton.energiaapi.repository;

import com.hackaton.energiaapi.entity.AnalisisEnergetico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalisisEnergeticoRepository extends JpaRepository<AnalisisEnergetico, Long> {
    List<AnalisisEnergetico> findAllByOrderByFechaCreacionDesc();
}
