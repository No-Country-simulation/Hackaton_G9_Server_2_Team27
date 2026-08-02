package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.dto.MLPredictionResponse;
import EnegiAI.Backend.model.Categoria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente de infraestructura encargado de comunicarse con el servicio
 * de Machine Learning desarrollado por el equipo de Data Science.
 *
 * Su responsabilidad consiste en enviar la información de consumo al
 * modelo predictivo, recuperar la clasificación generada y encapsular
 * los detalles de la comunicación HTTP para mantener desacoplada la
 * lógica de negocio de la implementación del servicio externo.
 *
 * Además, incorpora un mecanismo de recuperación que devuelve una
 * predicción por defecto cuando el servicio no está disponible,
 * permitiendo que la aplicación continúe operando de forma controlada.
 */

@Service
public class DataScienceClient {

    private final RestTemplate restTemplate;
    private final String dsApiUrl;

    /**
     * Inicializa el cliente con las dependencias necesarias para la
     * comunicación con el servicio de Machine Learning.
     *
     * @param restTemplate Cliente HTTP utilizado para realizar las solicitudes.
     * @param dsApiUrl URL base del servicio de Data Science.
     */
    public DataScienceClient(RestTemplate restTemplate,
                              @Value("${ds.api.url}") String dsApiUrl) {
        this.restTemplate = restTemplate;
        this.dsApiUrl = dsApiUrl;
    }

    /**
     * Solicita al servicio de Machine Learning la predicción asociada a
     * la información de consumo recibida.
     *
     * Si la respuesta es inválida o se produce un error durante la
     * comunicación, se retorna una predicción por defecto como mecanismo
     * de contingencia para evitar la interrupción del flujo de negocio.
     *
     * @param request Información de consumo enviada al modelo predictivo.
     * @return Predicción generada por el modelo o una predicción por defecto
     *         en caso de fallo.
     */
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

    /**
     * Construye una respuesta de respaldo utilizada cuando el servicio
     * de Machine Learning no puede proporcionar una predicción válida.
     *
     * Este mecanismo permite que la aplicación degrade su funcionamiento
     * de forma controlada sin interrumpir el procesamiento de la solicitud.
     *
     * @return Predicción por defecto utilizada como estrategia de recuperación.
     */
    private MLPredictionResponse valorPorDefecto() {
        return new MLPredictionResponse(Categoria.Moderado.toString(), 0.5);
    }
}
