package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;

@Service
public class ClasificacionService {

    public record ResultadoClasificacion(Categoria categoria, double probabilidad) {}

    /*
    // IDEA PARA CUANDO CARLOS ENTREGUE SU PARTE:
    private final DataScienceClient dataScienceClient;

    public ClasificacionService(DataScienceClient dataScienceClient) {
        this.dataScienceClient = dataScienceClient;
    }

    public ResultadoClasificacion obtenerClasificacion(ConsumoRequest request) {
        var respuesta = dataScienceClient.obtenerPrediccion(request);
        Categoria categoria = Categoria.fromFront(respuesta.categoria());
        return new ResultadoClasificacion(categoria, respuesta.probabilidad());
    }
    */

    // Por mientras (Temporal):
    public ResultadoClasificacion obtenerClasificacion(ConsumoRequest request) {
        double kWh = request.consumo_kwh() != null ? request.consumo_kwh() : 0.0;

        Categoria categoria;
        if (kWh < 150) {
            categoria = Categoria.Eficiente;
        } else if (kWh <= 300) {
            categoria = Categoria.Moderado;
        } else {
            categoria = Categoria.Ineficiente;
        }

        double probabilidad = 0.88;

        return new ResultadoClasificacion(categoria, probabilidad);
    }
}