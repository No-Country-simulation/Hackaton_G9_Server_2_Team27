package EnegiAI.Backend.service;

import EnegiAI.Backend.dto.ConsumoRequest;
import EnegiAI.Backend.model.Categoria;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecomendacionService {
    public List<String> generarRecomendaciones(ConsumoRequest request, Categoria categoria) {


        if (categoria != null && categoria == Categoria.Eficiente){
            var eficiente = List.of("¡Buen trabajo! Tu consumo se encuentra dentro de parámetros estables.");
            return eficiente;
        }

        if (categoria != null && categoria == Categoria.Moderado){
            var moderado = List.of("Tu consumo eléctrico es moderado, sigue las recomendaciones en EnergiIA");
            return moderado;
        }

        if (categoria != null && categoria == Categoria.Ineficiente){
            var moderado = List.of("Tu consumo eléctrico es alto, te recomendamos las instrucciones de EnergiIA ");
            return moderado;
        }


        List<String> recomendaciones = new ArrayList<>();



        if (Boolean.TRUE.equals(request.uso_horario_pico())) {
            recomendaciones.add("Reducir el uso de equipos durante los horarios pico.");
        }

        if (request.consumo_kwh() != null && request.consumo_kwh() > 300) {
            recomendaciones.add("Tu consumo es alto: revisa equipos antiguos o mal aislados.");
        }

        if (request.horas_alto_consumo() != null && request.horas_alto_consumo() > 5) {
            recomendaciones.add("Distribuir actividades de mayor consumo a lo largo del día para evitar picos prolongados.");
        }

        if (request.cantidad_equipos() != null && request.cantidad_equipos() > 10) {
            recomendaciones.add("Considera apagar equipos que no uses de forma simultánea.");
        }

        return recomendaciones;
    }
}
