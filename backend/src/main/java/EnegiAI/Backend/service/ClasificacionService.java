package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;


/**
 * Gestiona el proceso de clasificación del consumo energético mediante
 * la integración con el servicio de Ciencia de Datos.
 *
 * Este servicio actúa como un adaptador entre la capa de negocio y el
 * modelo de predicción, transformando la respuesta obtenida en un
 * resultado compatible con el modelo de dominio de la aplicación.
 */
@Service
public class ClasificacionService {

    /**
     * Representa el resultado de la clasificación realizada por el modelo
     * predictivo.
     *
     * Agrupa la categoría energética asignada y el nivel de confianza
     * asociado a dicha predicción, facilitando su transporte dentro de
     * la lógica de negocio.
     */
    public record ResultadoClasificacion(Categoria categoria, double probabilidad, java.util.List<String> recomendaciones) {}

    private final DataScienceClient dataScienceClient;

    /**
     * Inicializa el servicio con el cliente encargado de comunicarse
     * con el servicio de Ciencia de Datos.
     *
     * @param dataScienceClient Cliente responsable de solicitar las
     *                          predicciones al modelo de clasificación.
     */
    public ClasificacionService(DataScienceClient dataScienceClient) {
        this.dataScienceClient = dataScienceClient;
    }


    /**
     * Solicita la clasificación del consumo energético al modelo de
     * Ciencia de Datos y adapta su respuesta al modelo de dominio.
     *
     * La categoría recibida desde el servicio externo es convertida al
     * enumerado utilizado internamente por la aplicación, conservando
     * además la probabilidad asociada a la predicción.
     *
     * @param request Información de consumo suministrada por el usuario.
     * @return Resultado de la clasificación con la categoría y su probabilidad.
     */
    public ResultadoClasificacion obtenerClasificacion(ConsumoRequest request) {
        var respuesta = dataScienceClient.obtenerPrediccion(request);
        Categoria categoria = Categoria.fromFront(respuesta.categoria());
        return new ResultadoClasificacion(categoria, respuesta.probabilidad(), respuesta.recomendaciones());
    }
}