package com.hackaton.energiaapi.service;

import com.hackaton.energiaapi.dto.AnalisisRequestDTO;
import com.hackaton.energiaapi.dto.AnalisisResponseDTO;
import com.hackaton.energiaapi.entity.AnalisisEnergetico;
import java.util.List;

public interface AnalisisEnergeticoService {
    AnalisisResponseDTO procesarAnalisis(AnalisisRequestDTO request);

    List<AnalisisEnergetico> obtenerHistorial();

    AnalisisEnergetico obtenerPorId(Long id);
}
