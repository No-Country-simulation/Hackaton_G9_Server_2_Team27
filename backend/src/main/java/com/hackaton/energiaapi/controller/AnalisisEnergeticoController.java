package com.hackaton.energiaapi.controller;

import com.hackaton.energiaapi.dto.AnalisisRequestDTO;
import com.hackaton.energiaapi.dto.AnalisisResponseDTO;
import com.hackaton.energiaapi.entity.AnalisisEnergetico;
import com.hackaton.energiaapi.service.AnalisisEnergeticoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analisis-energetico")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Análisis Energético", description = "API REST para evaluación de consumo de energía, clasificación y estimación de costos")
public class AnalisisEnergeticoController {

    private final AnalisisEnergeticoService analisisEnergeticoService;

    @PostMapping
    @Operation(summary = "Procesar análisis de consumo energético y guardar historial", description = "Analiza los hábitos de consumo, guarda el registro en la base de datos y devuelve el análisis completo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Análisis procesado y guardado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o incompletos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<AnalisisResponseDTO> realizarAnalisis(@Valid @RequestBody AnalisisRequestDTO request) {
        AnalisisResponseDTO response = analisisEnergeticoService.procesarAnalisis(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Obtener historial de análisis", description = "Devuelve la lista de todos los análisis ordenados por fecha descendente.")
    @ApiResponse(responseCode = "200", description = "Historial recuperado exitosamente")
    public ResponseEntity<List<AnalisisEnergetico>> obtenerHistorial() {
        return ResponseEntity.ok(analisisEnergeticoService.obtenerHistorial());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener análisis por ID", description = "Devuelve un análisis específico utilizando su ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Análisis encontrado"),
            @ApiResponse(responseCode = "404", description = "Análisis no encontrado")
    })
    public ResponseEntity<AnalisisEnergetico> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(analisisEnergeticoService.obtenerPorId(id));
    }
}
