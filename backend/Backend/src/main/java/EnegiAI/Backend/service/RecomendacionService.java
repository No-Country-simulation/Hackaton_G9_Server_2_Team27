package EnegiAI.Backend.service;

import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RecomendacionService {
    public List<String> generarRecomendaciones(Categoria categoria) {

        if (categoria != null && categoria == Categoria.Eficiente) {
            var eficiente = List.of("¡Buen trabajo! Tu consumo se encuentra dentro de parámetros estables.");
            return eficiente;
        }

        if (categoria != null && categoria == Categoria.Moderado) {
            var moderado = List.of("Tu consumo eléctrico es moderado, sigue las recomendaciones en EnergiIA");
            return moderado;
        }

        if (categoria != null && categoria == Categoria.Ineficiente) {
            var moderado = List.of("Tu consumo eléctrico es alto, te recomendamos las instrucciones de EnergiIA ");
            return moderado;
        }

        throw new IllegalStateException("Categoria no reconocida: " + categoria);
    }
}
