package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.dto.MLPredictionResponse;
import EnegiAI.Backend.model.Categoria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente encargado de comunicarse con el servicio de Machine Learning
 * (FastAPI) desarrollado por el equipo de Data Science.
 *
 * Si el servicio no responde o falla, se aplica un valor por defecto
 * para garantizar que la API nunca se rompa (Plan B).
 */
@Service
public class DataScienceClient {

    private final RestTemplate restTemplate;
    private final String dsApiUrl;

    public DataScienceClient(RestTemplate restTemplate,
                              @Value("${ds.api.url}") String dsApiUrl) {
        this.restTemplate = restTemplate;
        this.dsApiUrl = dsApiUrl;
    }

    public MLPredictionResponse obtenerPrediccion(ConsumoRequest request) {
        try {
            MLPredictionResponse respuesta =
                    restTemplate.postForObject(dsApiUrl, request, MLPredictionResponse.class);

            if (respuesta == null || respuesta.categoria() == null) {
                return valorPorDefecto();
            }
            return respuesta;

        } catch (RestClientException e) {
            System.err.println("[DataScienceClient] Modelo no disponible o tardo demasiado: " + e.getMessage());
            return valorPorDefecto();
        }
    }

    private MLPredictionResponse valorPorDefecto() {
        return new MLPredictionResponse(Categoria.Moderado, 0.5);
    }
}
