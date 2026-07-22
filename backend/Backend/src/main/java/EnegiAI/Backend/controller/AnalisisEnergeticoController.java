package EnegiAI.Backend.controller;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.service.AnalisisEnergeticoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;


@RestController
public class AnalisisEnergeticoController {

        @PostMapping("/analisis-energetico")
        public ResponseEntity<?> realizarAnalisis(@RequestBody @Valid ConsumoRequest consumoRequestJson){
            System.out.println("FUNCIONA!");
            return ResponseEntity.ok(consumoRequestJson);
            //Retorna 200 OK no un 201 CREATED, dado que el análisis no persiste en ninguna BD aún
        }
//    @GetMapping("/analisis-energetico/{id}")
        @GetMapping("/health")
        public String health() {
            return AnalisisEnergeticoService.hola();
        }
}
