package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.dto.MLPredictionResponse;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DataScienceClientTest {

    @Test
    void cuandoModeloNoDisponible_debeRetornarValorPorDefecto() {
        // URL invalida a proposito, para forzar que la llamada falle
        // (simula que el modelo de Python esta caido)
        String urlInvalida = "http://localhost:9999/predict-no-existe";
        RestTemplate restTemplate = new RestTemplate();

        DataScienceClient client = new DataScienceClient(restTemplate, urlInvalida);

        ConsumoRequest request = new ConsumoRequest(420.0, true, 10, "Casa", 8, 100.0, 4);

        MLPredictionResponse resultado = client.obtenerPrediccion(request);

        // Verificamos que, a pesar del fallo, SI devuelve algo (no null, no excepcion)
        assertNotNull(resultado);
        assertEquals("Moderado", resultado.categoria());
        assertEquals(0.5, resultado.probabilidad());
    }
}
